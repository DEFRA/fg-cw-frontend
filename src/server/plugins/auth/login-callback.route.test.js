import Boom from "@hapi/boom";
import { load } from "cheerio";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { loginUserUseCase } from "../../../auth/use-cases/login-user.use-case.js";
import { logger } from "../../../common/logger.js";
import { createServer } from "../../index.js";
import { redirectCookieName } from "./redirect-cookie.js";

const createToken = (data) => {
  const header = Buffer.from(
    JSON.stringify({
      alg: "HS256",
      typ: "JWT",
    }),
  ).toString("base64");

  const payload = Buffer.from(
    JSON.stringify({
      sub: "1234567890",
      iat: 1516239022,
      oid: "12345678-1234-1234-1234-123456789012",
      exp: new Date("2050-01-01T00:00:00Z").getTime() / 1000,
      name: "Casey Test",
      email: "casey.test@example.test",
      roles: ["FCP.Casework.Read"],
      ...data,
    }),
  ).toString("base64");

  const signature = "qWxFhcz_GLCRL6LCDCUBg3JBdqw79Y31-_kkM--8nwQ";

  return `${header}.${payload}.${signature}`;
};

const accessToken = createToken({});
const refreshToken = createToken({ oid: undefined });

const user = {
  id: "43e8508b-6cbd-4ac1-b29e-e73792ab0f4b",
  name: "Casey Test",
  email: "casey.test@example.test",
  idpRoles: ["FCP.Casework.Read"],
  appRoles: ["ROLE_SING_AND_DANCE"],
};

/**
 * Both destinations the continue page offers: the refresh that takes the
 * browser onward, and the link behind it for one that will not follow. A guard
 * on where the user may be sent has to hold for both.
 */
const destinationsOf = (payload) => {
  const $ = load(payload);

  return {
    refresh: $('meta[http-equiv="refresh"]')
      .attr("content")
      ?.slice("0;url=".length),
    link: $("a").attr("href"),
  };
};

vi.mock("../../../auth/use-cases/login-user.use-case.js");

describe("loginCallbackRoute", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
    server.route({
      method: "GET",
      path: "/credentials",
      options: { auth: false },
      handler: (request) => request.yar.get("credentials"),
    });
    // Mints a genuine iron-encoded redirect cookie, rather than asserting
    // against a hand-rolled one that the real cookie need not resemble.
    server.route({
      method: "GET",
      path: "/remember",
      options: { auth: false },
      handler: (request, h) =>
        h.response().state(redirectCookieName, request.query.to),
    });
    await server.initialize();

    // Stands in for the code-for-token exchange with Entra ID.
    server.plugins["hapi-auth-oidc"].oidc.callback = async () => ({
      accessToken,
      refreshToken,
      idToken: "id-token",
      claims: { oid: "12345678-1234-1234-1234-123456789012" },
      expiresIn: 3600,
    });
  });

  beforeEach(() => {
    loginUserUseCase.mockResolvedValue(user);
  });

  const sessionCookie = (headers) =>
    headers["set-cookie"]
      .find((cookie) => cookie.startsWith("session="))
      .split(";")[0];

  const rememberedCookie = async (destination) => {
    const { headers } = await server.inject({
      method: "GET",
      url: `/remember?to=${encodeURIComponent(destination)}`,
    });

    return headers["set-cookie"][0].split(";")[0];
  };

  afterAll(async () => {
    await server.stop();
  });

  it.each(["GET", "POST"])(
    "accepts the authorisation code on %s",
    async (method) => {
      const { statusCode } = await server.inject({
        method,
        url: "/login/callback",
      });

      expect(statusCode).toEqual(200);
    },
  );

  it("records the login against the profile decoded from the access token", async () => {
    await server.inject({ method: "GET", url: "/login/callback" });

    expect(loginUserUseCase).toHaveBeenCalledWith({
      token: accessToken,
      profile: {
        oid: "12345678-1234-1234-1234-123456789012",
        name: "Casey Test",
        email: "casey.test@example.test",
        roles: ["FCP.Casework.Read"],
      },
    });
  });

  it("stores credentials and user in session", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/login/callback",
    });

    const credentialsResponse = await server.inject({
      method: "GET",
      url: "/credentials",
      headers: { cookie: sessionCookie(response.headers) },
    });

    // The field names predate the move to token federation and are load
    // bearing: route handlers across the app read `credentials.token`.
    expect(credentialsResponse.result).toEqual({
      token: accessToken,
      refreshToken,
      expiresAt: new Date("2050-01-01T00:00:00Z").getTime(),
      user: {
        id: user.id,
        idpRoles: ["FCP.Casework.Read"],
      },
    });
  });

  it("sends the user on to where they were heading", async () => {
    const { payload, headers } = await server.inject({
      method: "GET",
      url: "/login/callback",
      headers: { cookie: await rememberedCookie("/cases/123") },
    });

    expect(destinationsOf(payload)).toEqual({
      refresh: "/cases/123",
      link: "/cases/123",
    });

    // Spent, so a later sign in is not dragged back to the same page.
    expect(headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringMatching(new RegExp(`^${redirectCookieName}=;`)),
      ]),
    );
  });

  it("sends the user to the home page when nothing was remembered", async () => {
    const { payload } = await server.inject({
      method: "GET",
      url: "/login/callback",
    });

    expect(destinationsOf(payload)).toEqual({ refresh: "/", link: "/" });
  });

  it.each(["//evil.test", "/\\evil.test", "https://evil.test/", "evil.test"])(
    "refuses to send the user off site to %s",
    async (hostile) => {
      const { payload } = await server.inject({
        method: "GET",
        url: "/login/callback",
        headers: { cookie: await rememberedCookie(hostile) },
      });

      expect(destinationsOf(payload)).toEqual({ refresh: "/", link: "/" });
    },
  );

  it("does not let the continue page be cached", async () => {
    const { headers } = await server.inject({
      method: "GET",
      url: "/login/callback",
    });

    expect(headers["cache-control"]).toEqual("no-store");
  });

  it("logs safe CDP diagnostics when the token exchange fails", async () => {
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {});

    server.plugins["hapi-auth-oidc"].oidc.callback = async () => {
      throw Boom.unauthorized(
        "invalid_client (AADSTS7000222: private-email@example.test private-secret)",
      );
    };

    const { statusCode } = await server.inject({
      method: "GET",
      url: "/login/callback",
    });

    expect(statusCode).toEqual(401);
    expect(warn).toHaveBeenCalledWith(
      {
        error: {
          type: "EntraAuthenticationError",
          code: "AADSTS7000222",
          message: "Entra callback authentication failed",
        },
        tenant: {
          message: JSON.stringify({
            statusCode: 401,
            entraErrorCodes: [7000222],
          }),
        },
      },
      "Entra callback authentication failed",
    );
    // Scoped to our own line: hapi-pino separately logs the raw Boom for any
    // failed request, which is framework behaviour this cannot govern.
    expect(JSON.stringify(warn.mock.calls[0])).not.toContain("private");
  });
});

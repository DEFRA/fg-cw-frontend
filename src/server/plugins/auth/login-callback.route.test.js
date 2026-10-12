import Boom from "@hapi/boom";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { loginUserUseCase } from "../../../auth/use-cases/login-user.use-case.js";
import { createServer } from "../../index.js";
import { redirectCookieName } from "./redirect-cookie.js";

const callback = vi.fn();

// The real plugin would exchange the code with Entra, so stand in for it at the
// point the handler starts: a validated token set.
vi.mock("@defra/hapi-auth-oidc", async (importOriginal) => {
  const original = await importOriginal();

  return {
    ...original,
    hapiAuthOidcPlugin: {
      name: "hapi-auth-oidc",
      register(server) {
        server.decorate("request", "login", vi.fn());
        server.decorate("request", "callback", function (h) {
          return callback(this, h);
        });
        server.decorate("request", "ensureValidToken", vi.fn());
      },
    },
  };
});

vi.mock("../../../auth/use-cases/login-user.use-case.js");

const createToken = (payload) => {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");

  return [
    encode({ alg: "HS256", typ: "JWT" }),
    encode(payload),
    "qWxFhcz_GLCRL6LCDCUBg3JBdqw79Y31-_kkM--8nwQ",
  ].join(".");
};

const accessToken = createToken({
  oid: "12345678-1234-1234-1234-123456789012",
  name: "Bob Bill",
  email: "bob.bill@defra.gov.uk",
  roles: ["FCP.Casework.Read"],
});

const user = {
  id: "43e8508b-6cbd-4ac1-b29e-e73792ab0f4b",
  name: "Bob Bill",
  email: "bob.bill@defra.gov.uk",
  idpRoles: ["FCP.Casework.Read"],
  appRoles: ["ROLE_SING_AND_DANCE"],
};

describe("loginCallbackRoute", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();

    server.route({
      method: "GET",
      path: "/credentials",
      options: { auth: false },
      handler(request) {
        return request.yar.get("credentials");
      },
    });

    server.route({
      method: "GET",
      path: "/remember/{destination*}",
      options: { auth: false },
      handler(request, h) {
        return h
          .response("remembered")
          .state(redirectCookieName, `/${request.params.destination}`);
      },
    });

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  // Round-trips through hapi's own iron encoding rather than sealing by hand,
  // so the test exercises the encoding the plugin actually uses.
  const rememberedCookie = async (destination) => {
    const { headers } = await server.inject({
      method: "GET",
      url: `/remember${destination}`,
    });

    return headers["set-cookie"][0].split(";")[0];
  };

  const validToken = () => ({
    accessToken,
    refreshToken: "refresh-token",
    idToken: "id-token",
    expiresIn: 3600,
  });

  it.each(["GET", "POST"])(
    "accepts the %s Entra uses to return the user",
    async (method) => {
      callback.mockResolvedValue(validToken());
      loginUserUseCase.mockResolvedValue(user);

      const { statusCode } = await server.inject({
        method,
        url: "/login/callback",
      });

      expect(statusCode).toEqual(200);
    },
  );

  it("records the login with the profile decoded from the access token", async () => {
    callback.mockResolvedValue(validToken());
    loginUserUseCase.mockResolvedValue(user);

    await server.inject({ method: "GET", url: "/login/callback" });

    expect(loginUserUseCase).toHaveBeenCalledWith({
      token: accessToken,
      profile: {
        oid: "12345678-1234-1234-1234-123456789012",
        name: "Bob Bill",
        email: "bob.bill@defra.gov.uk",
        roles: ["FCP.Casework.Read"],
      },
    });
  });

  it("stores the session in the shape bell wrote, so live sessions survive the deploy", async () => {
    callback.mockResolvedValue(validToken());
    loginUserUseCase.mockResolvedValue(user);

    const response = await server.inject({
      method: "GET",
      url: "/login/callback",
    });

    const credentialsResponse = await server.inject({
      method: "GET",
      url: "/credentials",
      headers: {
        cookie: response.headers["set-cookie"]
          .find((cookie) => cookie.startsWith("session="))
          .split(";")[0],
      },
    });

    expect(credentialsResponse.result).toEqual({
      token: accessToken,
      refreshToken: "refresh-token",
      expiresAt: expect.any(Number),
      user: {
        id: "43e8508b-6cbd-4ac1-b29e-e73792ab0f4b",
        idpRoles: ["FCP.Casework.Read"],
      },
    });
  });

  it("returns the user to the page they originally asked for", async () => {
    callback.mockResolvedValue(validToken());
    loginUserUseCase.mockResolvedValue(user);

    const { statusCode, result, headers } = await server.inject({
      method: "GET",
      url: "/login/callback",
      headers: {
        cookie: await rememberedCookie("/cases/123"),
      },
    });

    expect(statusCode).toEqual(200);
    expect(result).toContain('content="0;url=/cases/123"');
    expect(headers["cache-control"]).toContain("no-store");
  });

  it("falls back to the home page when nothing was remembered", async () => {
    callback.mockResolvedValue(validToken());
    loginUserUseCase.mockResolvedValue(user);

    const { result } = await server.inject({
      method: "GET",
      url: "/login/callback",
    });

    expect(result).toContain('content="0;url=/"');
  });

  it("refuses an off-site destination", async () => {
    callback.mockResolvedValue(validToken());
    loginUserUseCase.mockResolvedValue(user);

    const { result } = await server.inject({
      method: "GET",
      url: "/login/callback",
      headers: {
        cookie: await rememberedCookie("//evil.test"),
      },
    });

    expect(result).toContain('content="0;url=/"');
    expect(result).not.toContain("evil.test");
  });

  it("fails when the handshake cannot be completed", async () => {
    callback.mockRejectedValue(Boom.unauthorized("Missing state in session"));

    const { statusCode } = await server.inject({
      method: "GET",
      url: "/login/callback",
    });

    expect(statusCode).toEqual(401);
  });

  it("throws when the user has no roles", async () => {
    callback.mockResolvedValue(validToken());
    loginUserUseCase.mockRejectedValue(
      Boom.badRequest(
        "User with IDP id '12345678-1234-1234-1234-123456789012' has no 'roles'",
      ),
    );

    const { statusCode } = await server.inject({
      method: "GET",
      url: "/login/callback",
    });

    expect(statusCode).toEqual(400);
  });
});

import Bell from "@hapi/bell";
import hapi from "@hapi/hapi";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { auth } from "../../common/auth.js";
import { nunjucks } from "../../common/nunjucks/nunjucks.js";
import { loginCallbackRoute } from "./login-callback.route.js";

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
      ...data,
    }),
  ).toString("base64");

  const signature = "qWxFhcz_GLCRL6LCDCUBg3JBdqw79Y31-_kkM--8nwQ";

  return `${header}.${payload}.${signature}`;
};

describe("loginCallbackRoute", () => {
  let server;

  beforeAll(async () => {
    Bell.simulate(async () => ({}));
    server = hapi.server();
    await server.register([nunjucks, auth.plugin]);
    server.route(loginCallbackRoute);
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
    Bell.simulate(false);
  });

  it("redirects to destination when logged in", async () => {
    const { statusCode, headers } = await server.inject({
      method: "GET",
      url: "/login/callback",
      auth: {
        strategy: "msEntraId",
        credentials: {
          query: {
            next: "/cases",
          },
        },
        artifacts: {
          id_token: createToken({
            roles: ["FCP.Casework.Read"],
          }),
        },
      },
    });

    expect(statusCode).toEqual(302);
    expect(headers.location).toEqual("/cases");
  });

  it("redirects to / when no next query param is provided", async () => {
    const { statusCode, headers } = await server.inject({
      method: "GET",
      url: "/login/callback",
      auth: {
        strategy: "msEntraId",
        credentials: {
          query: {},
        },
        artifacts: {
          id_token: createToken({
            roles: ["FCP.Casework.Read"],
          }),
        },
      },
    });
    expect(statusCode).toEqual(302);
    expect(headers.location).toEqual("/");
  });

  it("throws Boom.unauthorized when ID token cannot be decoded", async () => {
    const { result, statusCode } = await server.inject({
      method: "GET",
      url: "/login/callback",
      auth: {
        strategy: "msEntraId",
        credentials: {},
        artifacts: {
          id_token: "invalid.token.string",
          authenticated: true,
          authorised: true,
        },
      },
    });
    expect(statusCode).toEqual(400);
    expect(result).toEqual({
      statusCode: 400,
      error: "Bad Request",
      message:
        "User's ID token cannot be decoded: Invalid token specified: invalid base64 for part #2 (base64 string is not of the correct length)",
    });
  });

  it("throws Boom.badRequest when ID token is missing", async () => {
    const { result, statusCode } = await server.inject({
      method: "GET",
      url: "/login/callback",
      auth: {
        strategy: "msEntraId",
        credentials: {},
        artifacts: {
          id_token: null,
        },
      },
    });

    expect(statusCode).toEqual(400);
    expect(result).toEqual({
      statusCode: 400,
      error: "Bad Request",
      message: "User has no ID token. Cannot verify roles.",
    });
  });

  it("throws Boom.badRequest when roles not in ID token", async () => {
    const { result, statusCode } = await server.inject({
      method: "GET",
      url: "/login/callback",
      auth: {
        strategy: "msEntraId",
        credentials: {},
        artifacts: {
          id_token: createToken(),
          authenticated: true,
          authorised: true,
        },
      },
    });

    expect(statusCode).toEqual(400);
    expect(result).toEqual({
      statusCode: 400,
      error: "Bad Request",
      message:
        "User with IDP id '12345678-1234-1234-1234-123456789012' has no 'roles' claim in ID token",
    });
  });

  it("throws Boom.unauthorized when roles in token but no valid roles found", async () => {
    const { result, statusCode } = await server.inject({
      method: "GET",
      url: "/login/callback",
      auth: {
        strategy: "msEntraId",
        credentials: {
          query: {},
        },
        artifacts: {
          id_token: createToken({
            roles: [],
          }),
        },
      },
    });

    expect(statusCode).toEqual(401);
    expect(result).toEqual({
      statusCode: 401,
      error: "Unauthorized",
      message:
        "User with IDP id '12345678-1234-1234-1234-123456789012' has not been assigned a valid role. Expected one of [FCP.Casework.Read, FCP.Casework.ReadWrite, FCP.Casework.Admin], got []",
    });
  });
});

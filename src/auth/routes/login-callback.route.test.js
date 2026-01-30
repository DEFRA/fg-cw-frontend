import Bell from "@hapi/bell";
import Boom from "@hapi/boom";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createServer } from "../../server/index.js";
import { loginUserUseCase } from "../use-cases/login-user.use-case.js";
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

vi.mock("../use-cases/login-user.use-case.js");

describe("loginCallbackRoute", () => {
  let server;

  beforeAll(async () => {
    Bell.simulate(async () => ({}));
    server = await createServer();
    server.route(loginCallbackRoute);
  });

  afterAll(async () => {
    await server.stop();
    Bell.simulate(false);
  });

  it("creates or updates user and records login when authenticated and has IDP roles", async () => {
    await server.initialize();

    const credentials = {
      token: "mock-token",
      query: {
        next: "/cases",
      },
      profile: {
        oid: "12345678-1234-1234-1234-123456789012",
        name: "Bob Bill",
        email: "bob.bill.defra.gov.uk",
        roles: ["FCP.Casework.Read"],
      },
    };

    const user = {
      id: "123",
      idpId: "12345678-1234-1234-1234-123456789012",
      name: "Bob Bill",
      email: "bob.bill.defra.gov.uk",
    };

    loginUserUseCase.mockResolvedValue(user);

    await server.inject({
      method: "GET",
      url: "/login/callback",
      auth: {
        strategy: "entra",
        credentials,
      },
    });

    expect(loginUserUseCase).toHaveBeenCalledWith({
      token: credentials.token,
      profile: credentials.profile,
    });
  });

  it("stores credentials and user in session", async () => {
    server.route({
      method: "GET",
      path: "/credentials",
      handler(request) {
        return request.yar.get("credentials");
      },
    });

    await server.initialize();

    const user = {
      id: "43e8508b-6cbd-4ac1-b29e-e73792ab0f4b",
      name: "Bob Bill",
      email: "bob.bill.defra.gov.uk",
      idpRoles: ["FCP.Casework.Read"],
      appRoles: ["ROLE_SING_AND_DANCE"],
    };

    loginUserUseCase.mockResolvedValue(user);

    const response = await server.inject({
      method: "GET",
      url: "/login/callback",
      auth: {
        strategy: "entra",
        credentials: {
          query: {
            next: "/cases",
          },
          profile: {
            oid: "12345678-1234-1234-1234-123456789012",
            name: "Bob Bill",
            email: "bob.bill.defra.gov.uk",
            roles: ["FCP.Casework.Read"],
          },
          token: createToken({
            exp: new Date("2050-01-01T00:00:00Z").getTime() / 1000,
          }),
          refreshToken: createToken({
            exp: new Date("2060-01-01T00:00:00Z").getTime() / 1000,
          }),
          expiresIn: 3600,
        },
      },
    });

    const credentialsResponse = await server.inject({
      method: "GET",
      url: "/credentials",
      headers: {
        cookie: response.headers["set-cookie"][0].split(";")[0],
      },
    });

    expect(credentialsResponse.result).toEqual({
      token: expect.any(String),
      refreshToken: expect.any(String),
      expiresAt: expect.any(Number),
      user: {
        id: "43e8508b-6cbd-4ac1-b29e-e73792ab0f4b",
        idpRoles: ["FCP.Casework.Read"],
      },
    });
  });

  it("redirects to original destination when login successful", async () => {
    await server.initialize();

    const user = {
      id: "43e8508b-6cbd-4ac1-b29e-e73792ab0f4b",
      name: "Bob Bill",
      email: "bob.bill.defra.gov.uk",
      idpRoles: ["FCP.Casework.Read"],
      appRoles: ["ROLE_SING_AND_DANCE"],
    };

    loginUserUseCase.mockResolvedValue(user);

    const { statusCode, headers } = await server.inject({
      method: "GET",
      url: "/login/callback",
      auth: {
        strategy: "entra",
        credentials: {
          query: {
            next: "/cases",
          },
          profile: {
            oid: "12345678-1234-1234-1234-123456789012",
            name: "Bob Bill",
            email: "bob.bill.defra.gov.uk",
            roles: ["FCP.Casework.Read"],
          },
        },
        artifacts: {
          access_token: createToken({
            exp: new Date("2050-01-01T00:00:00Z").getTime() / 1000,
          }),
        },
      },
    });

    expect(statusCode).toEqual(302);
    expect(headers.location).toEqual("/cases");
  });

  it("redirects to / when no next query param is provided", async () => {
    await server.initialize();

    const user = {
      id: "43e8508b-6cbd-4ac1-b29e-e73792ab0f4b",
      name: "Bob Bill",
      email: "bob.bill.defra.gov.uk",
      idpRoles: ["FCP.Casework.Read"],
      appRoles: ["SING_AND_DANCE"],
    };

    loginUserUseCase.mockResolvedValue(user);

    const { statusCode, headers } = await server.inject({
      method: "GET",
      url: "/login/callback",
      auth: {
        strategy: "entra",
        credentials: {
          query: {},
          profile: {
            oid: "12345678-1234-1234-1234-123456789012",
            name: "Bob Bill",
            email: "bob.bill.defra.gov.uk",
            roles: ["FCP.Casework.Read"],
          },
        },
        artifacts: {
          access_token: createToken({
            exp: new Date("2050-01-01T00:00:00Z").getTime() / 1000,
          }),
          id_token: createToken({
            roles: ["FCP.Casework.Read"],
          }),
        },
      },
    });
    expect(statusCode).toEqual(302);
    expect(headers.location).toEqual("/");
  });

  it("throws error when user has no roles", async () => {
    await server.initialize();

    const error = Boom.badRequest(
      "User with IDP id '12345678-1234-1234-1234-123456789012' has no 'roles'",
    );
    loginUserUseCase.mockRejectedValue(error);

    const { statusCode } = await server.inject({
      method: "GET",
      url: "/login/callback",
      auth: {
        strategy: "entra",
        credentials: {
          query: {},
          profile: {
            oid: "12345678-1234-1234-1234-123456789012",
            name: "Bob Bill",
            email: "bob.bill.defra.gov.uk",
            // no roles
          },
        },
      },
    });

    expect(statusCode).toEqual(400);
  });
});

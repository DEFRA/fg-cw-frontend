import Bell from "@hapi/bell";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createServer } from "../../server.js";
import { createOrUpdateUserUseCase } from "../use-cases/create-or-update-user.use-case.js";
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

vi.mock("../use-cases/create-or-update-user.use-case.js");

describe("loginCallbackRoute", () => {
  let server;

  beforeAll(async () => {
    Bell.simulate(async () => ({}));
    server = await createServer();
    server.route(loginCallbackRoute);
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
    Bell.simulate(false);
  });

  it("creates or updates the user's account when authenticated and has IDP roles", async () => {
    await server.inject({
      method: "GET",
      url: "/login/callback",
      auth: {
        strategy: "msEntraId",
        credentials: {
          query: {
            next: "/cases",
          },
          profile: {
            email: "bob.bill.defra.gov.uk",
          },
        },
        artifacts: {
          id_token: createToken({
            roles: ["FCP.Casework.Read"],
            name: "Bob Bill",
          }),
        },
      },
    });

    expect(createOrUpdateUserUseCase).toHaveBeenCalledWith({
      idToken: {
        sub: "1234567890",
        iat: 1516239022,
        oid: "12345678-1234-1234-1234-123456789012",
        name: "Bob Bill",
        roles: ["FCP.Casework.Read"],
      },
      email: "bob.bill.defra.gov.uk",
    });
  });

  it("redirects to original destination when login successful", async () => {
    const { statusCode, headers } = await server.inject({
      method: "GET",
      url: "/login/callback",
      auth: {
        strategy: "msEntraId",
        credentials: {
          query: {
            next: "/cases",
          },
          profile: {
            email: "bob.bill.defra.gov.uk",
          },
        },
        artifacts: {
          id_token: createToken({
            roles: ["FCP.Casework.Read"],
            name: "Bob Bill",
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
          profile: {
            email: "bob.bill.defra.gov.uk",
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
    expect(headers.location).toEqual("/");
  });

  it("throws Boom.unauthorized when ID token cannot be decoded", async () => {
    const { result, statusCode } = await server.inject({
      method: "GET",
      url: "/login/callback",
      auth: {
        strategy: "msEntraId",
        credentials: {
          profile: {
            email: "bob.bill.defra.gov.uk",
          },
        },
        artifacts: {
          id_token: "invalid.token.string",
          authenticated: true,
          authorised: true,
        },
      },
    });

    expect(statusCode).toEqual(400);
    expect(result).toContain(
      "User&#39;s ID token cannot be decoded: Invalid token specified: invalid base64 for part #2 (base64 string is not of the correct length)",
    );
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
    expect(result).toContain("User has no ID token. Cannot verify roles.");
  });
});

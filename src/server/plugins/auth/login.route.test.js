import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { logger } from "../../../common/logger.js";
import { createServer } from "../../index.js";

const authorizeUrl = "https://login.microsoftonline.com/authorize";

describe("loginRoute", () => {
  let server;
  let login;

  beforeAll(async () => {
    server = await createServer();
    await server.initialize();

    // Stands in for discovery and the PKCE challenge, which need the identity
    // provider; that the handler delegates to them is what matters here.
    login = server.plugins["hapi-auth-oidc"].oidc;
    login.login = async (_request, h) => h.redirect(authorizeUrl).takeover();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("hands an anonymous user to the identity provider", async () => {
    const { statusCode, headers } = await server.inject({
      method: "GET",
      url: "/login",
    });

    expect(statusCode).toEqual(302);
    expect(headers.location).toEqual(authorizeUrl);
  });

  it("logs the transport code when the identity provider cannot be reached", async () => {
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {});
    login.login = async () => {
      throw new TypeError("fetch failed", {
        cause: new AggregateError([
          Object.assign(new Error("private host"), { code: "ECONNREFUSED" }),
        ]),
      });
    };

    const { statusCode } = await server.inject({
      method: "GET",
      url: "/login",
    });

    expect(statusCode).toEqual(500);
    expect(warn.mock.calls[0][0].error).toEqual({
      type: "EntraAuthenticationError",
      code: "ECONNREFUSED",
      message: "Entra login redirect failed",
    });
    warn.mockRestore();
  });
});

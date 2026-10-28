import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "../../index.js";

const authorizeUrl = "https://login.microsoftonline.com/authorize";

describe("loginRoute", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
    await server.initialize();

    // Stands in for discovery and the PKCE challenge, which need the identity
    // provider; that the handler delegates to them is what matters here.
    server.plugins["hapi-auth-oidc"].oidc.login = async (_request, h) =>
      h.redirect(authorizeUrl).takeover();
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
});

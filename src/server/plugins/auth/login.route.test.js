import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createServer } from "../../index.js";

const login = vi.fn();

// The real plugin would reach Entra's discovery endpoint on the first login, so
// stand in for it and assert the route delegates rather than what it returns.
vi.mock("@defra/hapi-auth-oidc", async (importOriginal) => {
  const original = await importOriginal();

  return {
    ...original,
    hapiAuthOidcPlugin: {
      name: "hapi-auth-oidc",
      register(server) {
        server.decorate("request", "login", function (h) {
          return login(this, h);
        });
        server.decorate("request", "callback", vi.fn());
        server.decorate("request", "ensureValidToken", vi.fn());
      },
    },
  };
});

describe("loginRoute", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("starts the OIDC handshake", async () => {
    login.mockImplementation((_request, h) =>
      h.redirect("https://login.microsoftonline.com/authorize").takeover(),
    );

    const { statusCode, headers } = await server.inject({
      method: "GET",
      url: "/login",
    });

    expect(login).toHaveBeenCalled();
    expect(statusCode).toEqual(302);
    expect(headers.location).toEqual(
      "https://login.microsoftonline.com/authorize",
    );
  });

  it("is reachable without a session, so a signed out user is not looped back", async () => {
    login.mockImplementation((_request, h) => h.redirect("/").takeover());

    const { statusCode, headers } = await server.inject({
      method: "GET",
      url: "/login",
    });

    expect(statusCode).toEqual(302);
    expect(headers.location).not.toEqual("/login");
  });
});

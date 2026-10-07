import { describe, expect, it } from "vitest";
import { config } from "../../../common/config.js";
import { createServer } from "../../index.js";
import { redirectCookieName } from "./redirect-cookie.js";

describe("auth plugin", () => {
  it("registers the OIDC handshake cookie", async () => {
    const server = await createServer();
    await server.initialize();

    expect(server.states.cookies["hapi-auth-oidc"]).toEqual(
      expect.objectContaining({
        encoding: "iron",
        isHttpOnly: true,
        isSecure: config.get("session.cookie.secure"),
        password: config.get("oidc.cookie.password"),
      }),
    );
  });

  it("registers the redirect cookie that replaces ?next=", async () => {
    const server = await createServer();
    await server.initialize();

    expect(server.states.cookies[redirectCookieName]).toEqual(
      expect.objectContaining({
        encoding: "iron",
        isHttpOnly: true,
        ttl: 600_000,
      }),
    );
  });

  it("defaults every route to the session strategy", async () => {
    const server = await createServer();

    server.route({
      method: "GET",
      path: "/restricted",
      handler: () => "You are authenticated",
    });

    await server.initialize();

    const { statusCode, headers } = await server.inject({
      method: "GET",
      url: "/restricted",
    });

    expect(statusCode).toBe(302);
    expect(headers.location).toBe("/login");
  });

  it("remembers the deep link a signed out user asked for", async () => {
    const server = await createServer();

    server.route({
      method: "GET",
      path: "/restricted",
      handler: () => "You are authenticated",
    });

    await server.initialize();

    const { headers } = await server.inject({
      method: "GET",
      url: "/restricted?tab=notes",
    });

    const redirectCookie = headers["set-cookie"].find((cookie) =>
      cookie.startsWith(`${redirectCookieName}=`),
    );

    expect(redirectCookie).toBeDefined();
    expect(redirectCookie).toContain("HttpOnly");
  });

  it("lets a route opt out of authentication", async () => {
    const server = await createServer();

    server.route({
      method: "GET",
      path: "/anonymous",
      options: { auth: false },
      handler: () => "Anyone can see this",
    });

    await server.initialize();

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/anonymous",
    });

    expect(statusCode).toBe(200);
    expect(result).toBe("Anyone can see this");
  });
});

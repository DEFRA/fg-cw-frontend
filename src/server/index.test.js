import Boom from "@hapi/boom";
import { describe, expect, it } from "vitest";
import { config } from "../common/config.js";
import { createServer } from "./index.js";

describe("server", () => {
  it("strips trailing slashes", async () => {
    const server = await createServer();

    server.route({
      method: "GET",
      path: "/path",
      handler: () => "Hello, World!",
    });

    await server.initialize();

    const response = await server.inject({
      method: "GET",
      url: "/path/",
      auth: {
        credentials: {},
        strategy: "session",
        mode: "required",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.request.url.pathname).toBe("/path");
  });

  it("redirects / to /cases", async () => {
    const server = await createServer();
    await server.initialize();

    const response = await server.inject({
      method: "GET",
      url: "/",
      auth: {
        credentials: {
          user: { idpRoles: ["FCP.Casework.Read"] },
        },
        strategy: "session",
        mode: "required",
      },
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("/cases");
  });

  it("serves static assest from /public", async () => {
    const server = await createServer();
    await server.initialize();

    const routes = server.table().map((r) => ({
      path: r.path,
      method: r.method,
    }));

    expect(routes).toEqual(
      expect.arrayContaining([
        {
          method: "get",
          path: "/public/{param*}",
        },
      ]),
    );
  });

  it("renders an error page when routes throw", async () => {
    const server = await createServer();

    server.route({
      method: "GET",
      path: "/broken",
      async handler() {
        throw Boom.badImplementation("Snap!");
      },
    });

    await server.initialize();

    const { result, statusCode } = await server.inject({
      method: "GET",
      url: "/broken",
      auth: {
        credentials: {},
        strategy: "session",
        mode: "required",
      },
    });

    expect(statusCode).toBe(500);
    expect(result).toContain("Snap!");
  });

  it("configures session cookie", async () => {
    const server = await createServer();
    await server.initialize();

    expect(server.states.cookies.session).toEqual({
      clearInvalid: true,
      domain: null,
      encoding: "iron",
      ignoreErrors: true,
      isHttpOnly: true,
      isPartitioned: false,
      isSameSite: "Strict",
      isSecure: config.get("isProduction"),
      password: config.get("session.cookie.password"),
      path: "/",
      strictHeader: true,
      ttl: config.get("session.cookie.ttl"),
    });
  });

  it("configures OAuth flow cookies", async () => {
    const server = await createServer();
    await server.initialize();

    const relaxedForTheCrossSiteReturn = {
      isSecure: config.get("session.cookie.secure"),
      isSameSite: config.get("session.cookie.secure") ? "None" : "Lax",
      password: config.get("oidc.cookie.password"),
    };

    expect(server.states.cookies["hapi-auth-oidc"]).toMatchObject(
      relaxedForTheCrossSiteReturn,
    );

    expect(server.states.cookies["auth-redirect"]).toMatchObject({
      ...relaxedForTheCrossSiteReturn,
      encoding: "iron",
      isHttpOnly: true,
      path: "/",
    });
  });

  it("redirects to login without a valid session", async () => {
    const server = await createServer();

    server.route({
      method: "GET",
      path: "/restricted",
      options: {
        auth: {
          mode: "required",
          strategy: "session",
        },
      },
      handler() {
        return "You are authenticated";
      },
    });

    await server.initialize();

    const response = await server.inject({
      method: "GET",
      url: "/restricted",
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toEqual("/login");

    // Where the user was heading rides a cookie rather than a query string,
    // because Entra returns them by a cross-site POST.
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringContaining("auth-redirect=")]),
    );
  });

  it("allows access to route when authenticated", async () => {
    const server = await createServer();

    server.route({
      method: "POST",
      path: "/setup-session",
      handler(request, h) {
        request.yar.set("credentials", {
          token: "access-token",
          refreshToken: "refresh-token",
          expiresAt: Date.now() + 3600000,
        });
        return h.response().code(204);
      },
    });

    server.route({
      method: "GET",
      path: "/restricted",
      options: {
        auth: {
          mode: "required",
          strategy: "session",
        },
      },
      handler() {
        return "You are authenticated";
      },
    });

    await server.initialize();

    // Whether the token needs refreshing is session-scheme.test.js's subject.
    server.plugins["hapi-auth-oidc"].oidc.ensureValidToken = async (
      _request,
      token,
    ) => ({ token, refreshed: false });

    const setupSessionResponse = await server.inject({
      method: "POST",
      url: "/setup-session",
      auth: {
        credentials: {},
        strategy: "session",
        mode: "required",
      },
    });

    const response = await server.inject({
      method: "GET",
      url: "/restricted",
      headers: {
        cookie: setupSessionResponse.headers["set-cookie"][0].split(";")[0],
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.result).toBe("You are authenticated");
  });
});

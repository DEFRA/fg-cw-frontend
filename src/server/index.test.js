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

  it("configures OAuth flow cookie", async () => {
    const server = await createServer();
    await server.initialize();

    expect(server.states.cookies["bell-entra"]).toEqual({
      clearInvalid: true,
      encoding: "iron",
      ignoreErrors: true,
      isHttpOnly: true,
      isPartitioned: false,
      isSameSite: "Strict",
      isSecure: config.get("isProduction"),
      password: config.get("session.cookie.password"),
      path: "/",
      strictHeader: true,
    });
  });

  it("redirects to login when unauthenticated with Entra ID", async () => {
    const server = await createServer();

    server.route({
      method: "GET",
      path: "/restricted",
      options: {
        auth: {
          mode: "required",
          strategy: "entra",
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

    const { host, searchParams } = new URL(response.headers.location);

    expect(host).toEqual("localhost:3010");

    expect(searchParams.get("response_type")).toEqual("code");
    expect(searchParams.get("redirect_uri")).toEqual(
      `http://${config.get("host")}:${config.get("port")}/login/callback`,
    );
    expect(searchParams.get("state")).toEqual(expect.any(String));
    expect(searchParams.get("scope")).toEqual(
      `openid profile email offline_access api://${config.get("oidc.clientId")}/cw.backend`,
    );
    expect(searchParams.get("client_id")).toEqual(config.get("oidc.clientId"));
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

    expect(response.headers.location).toEqual(
      `/login?${new URLSearchParams({
        next: `http://${config.get("host")}:${config.get("port")}/restricted`,
      })}`,
    );
  });

  it("redirects to login when session expires", async () => {
    const server = await createServer();

    server.route({
      method: "POST",
      path: "/setup-session",
      handler(request, h) {
        request.yar.set("credentials", {
          expiresAt: Date.now() - 1000, // Simulate an expired session
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

    const setupSessionResponse = await server.inject({
      method: "POST",
      url: "/setup-session",
    });

    const response = await server.inject({
      method: "GET",
      url: "/restricted",
      headers: {
        cookie: setupSessionResponse.headers["set-cookie"][0].split(";")[0],
      },
    });

    expect(response.statusCode).toBe(302);

    expect(response.headers.location).toEqual(
      `/login?${new URLSearchParams({
        next: `http://${config.get("host")}:${config.get("port")}/restricted`,
      })}`,
    );
  });

  it("allows access to route when authenticated", async () => {
    const server = await createServer();

    server.route({
      method: "POST",
      path: "/setup-session",
      handler(request, h) {
        request.yar.set("credentials", {
          expiresAt: Date.now() + 3600000, // Simulate a valid session
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

    const setupSessionResponse = await server.inject({
      method: "POST",
      url: "/setup-session",
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

import Boom from "@hapi/boom";
import { describe, expect, it } from "vitest";
import { config } from "./common/config.js";
import { createServer } from "./server.js";

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

    expect(server.states.cookies["bell-azure"]).toEqual({
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
});

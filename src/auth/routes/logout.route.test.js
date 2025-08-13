import Bell from "@hapi/bell";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "../../server/index.js";
import { logoutRoute } from "./logout.route.js";

describe("logoutRoute", () => {
  let server;

  beforeAll(async () => {
    Bell.simulate(async () => ({}));
    server = await createServer();
    server.route(logoutRoute);
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
    Bell.simulate(false);
  });

  it("clears the session", async () => {
    server.route({
      method: "GET",
      path: "/add-to-session",
      handler: (request, h) => {
        request.yar.set("foo", {
          value: true,
        });

        return h.response().code(204);
      },
    });

    await server.inject({
      method: "GET",
      url: "/add-to-session",
      auth: {
        strategy: "msEntraId",
        credentials: {},
      },
    });

    const logoutResponse = await server.inject({
      method: "GET",
      url: "/logout",
      auth: {
        strategy: "msEntraId",
        credentials: {},
      },
    });

    expect(logoutResponse.request.yar.get("foo")).toBeNull();
  });

  it("redirects to the home page", async () => {
    const { headers, statusCode } = await server.inject({
      method: "GET",
      url: "/logout",
    });

    expect(statusCode).toEqual(302);
    expect(headers.location).toEqual("/");
  });
});

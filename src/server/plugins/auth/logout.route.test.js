import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "../../index.js";

describe("logoutRoute", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
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

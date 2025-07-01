import Bell from "@hapi/bell";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "../../server.js";
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

  it("clears the session cookie", async () => {
    const { headers, statusCode } = await server.inject({
      method: "GET",
      url: "/logout",
      auth: {
        strategy: "msEntraId",
        credentials: {
          query: {
            next: "/cases",
          },
        },
      },
    });

    expect(statusCode).toEqual(302);
    expect(headers["set-cookie"]).toEqual([
      "session=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict; Path=/",
    ]);
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

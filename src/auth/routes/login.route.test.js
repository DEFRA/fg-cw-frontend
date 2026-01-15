import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "../../server/index.js";
import { loginRoute } from "./login.route.js";

describe("loginRoute", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
    server.route(loginRoute);
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("returns 200", async () => {
    const { statusCode } = await server.inject({
      method: "GET",
      url: "/login",
      auth: {
        strategy: "entra",
        credentials: {},
      },
    });

    expect(statusCode).toEqual(200);
  });
});

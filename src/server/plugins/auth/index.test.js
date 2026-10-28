import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer } from "../../index.js";

describe("auth plugin", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("registers the routes a user signs in and out through", () => {
    const routes = server.table().map(({ method, path }) => ({ method, path }));

    expect(routes).toEqual(
      expect.arrayContaining([
        { method: "get", path: "/login" },
        { method: "get", path: "/login/callback" },
        { method: "post", path: "/login/callback" },
        { method: "get", path: "/logout" },
      ]),
    );
  });
});

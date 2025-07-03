import { beforeEach, describe, expect, it } from "vitest";
import { createServer } from "../server.js";
import { auth } from "./index.js";

describe("auth", () => {
  let server;

  beforeEach(async () => {
    server = await createServer();
    await server.register(auth);
    await server.initialize();
  });

  it("registers routes", async () => {
    const routes = server.table().map((r) => ({
      path: r.path,
      method: r.method,
    }));

    expect(routes).toEqual(
      expect.arrayContaining([
        { method: "get", path: "/login" },
        { method: "get", path: "/login/callback" },
        { method: "get", path: "/logout" },
      ]),
    );
  });
});

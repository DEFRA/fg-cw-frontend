import { beforeEach, describe, expect, it } from "vitest";
import { createServer } from "../server/index.js";
import { admin } from "./index.js";

describe("admin", () => {
  let server;

  beforeEach(async () => {
    server = await createServer();
    await server.register(admin);
    await server.initialize();
  });

  it("registers routes", async () => {
    const routes = server.table().map((r) => ({
      path: r.path,
      method: r.method,
    }));

    expect(routes).toEqual(
      expect.arrayContaining([
        { method: "get", path: "/admin/user-management" },
      ]),
    );
  });
});

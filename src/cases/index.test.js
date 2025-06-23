import hapi from "@hapi/hapi";
import { beforeEach, describe, expect, test } from "vitest";
import { cases } from "./index.js";

describe("cases plugin", () => {
  let server;

  beforeEach(async () => {
    server = hapi.server();
  });

  test("registers all expected routes when plugged into server", async () => {
    await server.register(cases);
    await server.initialize();

    const routes = server.table().map((r) => ({
      path: r.path,
      method: r.method,
    }));

    expect(routes).toEqual([
      { method: "get", path: "/cases" },
      { method: "get", path: "/cases/{caseId}" },
      { method: "get", path: "/cases/{caseId}/case-details" },
      { method: "get", path: "/cases/{caseId}/tasks/{taskGroupId}/{taskId}" },
      { method: "post", path: "/cases/{caseId}" },
      {
        method: "post",
        path: "/cases/{caseId}/stages/{stageId}/task-groups/{taskGroupId}/tasks/{taskId}/status",
      },
    ]);
  });

  test("plugin can be registered multiple times on different servers", async () => {
    const server1 = hapi.server();
    const server2 = hapi.server();

    await expect(server1.register(cases)).resolves.not.toThrow();
    await expect(server2.register(cases)).resolves.not.toThrow();

    await server1.initialize();
    await server2.initialize();

    expect(server1.table()).toHaveLength(6);
    expect(server2.table()).toHaveLength(6);
  });

  test("plugin name is correctly set", () => {
    expect(cases.plugin.name).toBe("cases");
    expect(cases.plugin.name).not.toBe("");
    expect(cases.plugin.name).not.toBeNull();
    expect(cases.plugin.name).not.toBeUndefined();
  });
});

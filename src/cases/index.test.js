import hapi from "@hapi/hapi";
import { beforeEach, describe, expect, test } from "vitest";
import { auth } from "../common/auth.js";
import { cases } from "./index.js";

describe("cases plugin", () => {
  let server;

  beforeEach(async () => {
    server = hapi.server();
  });

  test("registers all expected routes when plugged into server", async () => {
    await server.register([auth.plugin]);
    await server.register(cases);
    await server.initialize();

    const routes = server.table().map((r) => ({
      path: r.path,
      method: r.method,
    }));

    expect(routes).toEqual([
      { method: "get", path: "/cases" },
      { method: "get", path: "/logout" },
      { method: "get", path: "/secret" },
      { method: "get", path: "/cases/{caseId}" },
      { method: "get", path: "/login/callback" },
      { method: "get", path: "/cases/{caseId}/case-details" },
      { method: "get", path: "/cases/{caseId}/tasks/{taskGroupId}/{taskId}" },
      { method: "post", path: "/cases/{caseId}" },
      {
        method: "post",
        path: "/cases/{caseId}/stages/{stageId}/task-groups/{taskGroupId}/tasks/{taskId}/status",
      },
    ]);
  });
});

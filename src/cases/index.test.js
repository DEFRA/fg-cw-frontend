import { beforeEach, describe, expect, test } from "vitest";
import { createServer } from "../server/index.js";
import { cases } from "./index.js";

describe("cases", () => {
  let server;

  beforeEach(async () => {
    server = await createServer();
    await server.register(cases);
    await server.initialize();
  });

  test("registers routes", async () => {
    const routes = server.table().map((r) => ({
      path: r.path,
      method: r.method,
    }));

    expect(routes).toEqual(
      expect.arrayContaining([
        { method: "get", path: "/cases" },
        { method: "get", path: "/secret" },
        {
          method: "get",
          path: "/",
        },
        {
          method: "get",
          path: "/cases/assign-user",
        },
        { method: "get", path: "/cases/{caseId}" },
        {
          method: "get",
          path: "/public/{param*}",
        },
        {
          method: "get",
          path: "/cases/{caseId}/{tabId}",
        },
        {
          method: "get",
          path: "/cases/{caseId}/timeline",
        },
        { method: "get", path: "/cases/{caseId}/notes" },
        {
          method: "get",
          path: "/secret/workflow/{workflowCode}",
        },
        { method: "get", path: "/cases/{caseId}/notes/new" },
        { method: "get", path: "/cases/{caseId}/tasks/{taskGroupId}/{taskId}" },
        {
          method: "post",
          path: "/cases/assign-user",
        },
        { method: "post", path: "/cases/{caseId}/notes" },
        { method: "post", path: "/cases/{caseId}/stage/outcome" },
        {
          method: "post",
          path: "/cases/{caseId}/stages/{stageId}/task-groups/{taskGroupId}/tasks/{taskId}/status",
        },
        { method: "get", path: "/cases/{caseId}/components" },
        { method: "get", path: "/cases/{caseId}/components/edit" },
        { method: "post", path: "/cases/{caseId}/components/edit" },
        { method: "post", path: "/cases/{caseId}/components/api" },
      ]),
    );
  });
});

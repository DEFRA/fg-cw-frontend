import { beforeEach, describe, expect, test } from "vitest";
import { createServer } from "../server.js";
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
        { method: "get", path: "/cases/{caseId}" },
        { method: "get", path: "/cases/{caseId}/case-details" },
        { method: "get", path: "/cases/{caseId}/tasks/{taskGroupId}/{taskId}" },
        { method: "post", path: "/cases/{caseId}" },
        {
          method: "post",
          path: "/cases/{caseId}/stages/{stageId}/task-groups/{taskGroupId}/tasks/{taskId}/status",
        },
      ]),
    );
  });
});

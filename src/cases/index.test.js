import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { config } from "../common/config.js";
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

    expect(routes).toEqual([
      {
        method: "get",
        path: "/cases",
      },
      {
        method: "get",
        path: "/login",
      },
      {
        method: "get",
        path: "/logout",
      },
      {
        method: "get",
        path: "/reports",
      },
      {
        method: "get",
        path: "/secret",
      },
      {
        method: "get",
        path: "/",
      },
      {
        method: "get",
        path: "/agreement/{path*}",
      },
      {
        method: "get",
        path: "/cases/assign-user",
      },
      {
        method: "get",
        path: "/cases/{caseId}",
      },
      {
        method: "get",
        path: "/login/callback",
      },
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
        path: "/cases/{caseId}/notes",
      },
      {
        method: "get",
        path: "/cases/{caseId}/timeline",
      },
      {
        method: "get",
        path: "/cases/{caseId}/components",
      },
      {
        method: "get",
        path: "/secret/workflow/{workflowCode}",
      },
      {
        method: "get",
        path: "/cases/{caseId}/components/edit",
      },
      {
        method: "get",
        path: "/cases/{caseId}/notes/new",
      },
      {
        method: "get",
        path: "/cases/{caseId}/agreement/{agreementRef}",
      },
      {
        method: "get",
        path: "/cases/{caseId}/stage/outcome/confirm",
      },
      {
        method: "get",
        path: "/cases/{caseId}/tasks/{taskGroupCode}/{taskCode}",
      },
      {
        method: "post",
        path: "/cases/assign-user",
      },
      {
        method: "post",
        path: "/login/callback",
      },
      {
        method: "post",
        path: "/cases/{caseId}/page-action",
      },
      {
        method: "post",
        path: "/cases/{caseId}/notes",
      },
      {
        method: "post",
        path: "/cases/{caseId}/components/edit",
      },
      {
        method: "post",
        path: "/cases/{caseId}/stage/outcome",
      },
      {
        method: "post",
        path: "/cases/{caseId}/stage/outcome/confirm",
      },
      {
        method: "post",
        path: "/cases/{caseId}/task-groups/{taskGroupCode}/tasks/{taskCode}/value",
      },
    ]);
  });

  describe("when the component editor is disabled", () => {
    beforeEach(async () => {
      config.set("isComponentEditorEnabled", false);
      server = await createServer();
      await server.register(cases);
      await server.initialize();
    });

    afterEach(() => {
      config.set("isComponentEditorEnabled", true);
    });

    test("does not register the component editor routes", () => {
      const paths = server.table().map((r) => r.path);

      expect(paths).not.toContain("/cases/{caseId}/components");
      expect(paths).not.toContain("/cases/{caseId}/components/edit");
    });
  });
});

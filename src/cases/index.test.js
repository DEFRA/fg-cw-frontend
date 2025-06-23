import { describe, expect, test, vi } from "vitest";
import { cases } from "./index.js";
import { completeStageRoute } from "./routes/complete-stage.route.js";
import { listCasesRoute } from "./routes/list-cases.route.js";
import { listTasksRoute } from "./routes/list-tasks.route.js";
import { updateTaskStatusRoute } from "./routes/update-task-status.route.js";
import { viewCaseRoute } from "./routes/view-case.route.js";
import { viewTaskRoute } from "./routes/view-task.route.js";

vi.mock("./routes/complete-stage.route.js");
vi.mock("./routes/list-cases.route.js");
vi.mock("./routes/list-tasks.route.js");
vi.mock("./routes/update-task-status.route.js");
vi.mock("./routes/view-case.route.js");
vi.mock("./routes/view-task.route.js");

describe("cases plugin", () => {
  test("exports plugin object with correct name", () => {
    expect(cases).toBeDefined();
    expect(cases.plugin).toBeDefined();
    expect(cases.plugin.name).toBe("cases");
    expect(typeof cases.plugin.register).toBe("function");
  });

  test("register function calls server.route with all routes", () => {
    const mockServer = {
      route: vi.fn(),
    };

    cases.plugin.register(mockServer);

    expect(mockServer.route).toHaveBeenCalledOnce();
    expect(mockServer.route).toHaveBeenCalledWith([
      listCasesRoute,
      viewCaseRoute,
      listTasksRoute,
      viewTaskRoute,
      updateTaskStatusRoute,
      completeStageRoute,
    ]);
  });

  test("register function handles server without route method gracefully", () => {
    const mockServer = {};

    expect(() => {
      cases.plugin.register(mockServer);
    }).toThrow();
  });

  test("plugin structure matches Hapi.js plugin format", () => {
    expect(cases.plugin).toHaveProperty("name");
    expect(cases.plugin).toHaveProperty("register");
    expect(typeof cases.plugin.name).toBe("string");
    expect(typeof cases.plugin.register).toBe("function");
  });

  test("register function accepts server parameter", () => {
    const mockServer = {
      route: vi.fn(),
    };

    // Should not throw when called with proper server object
    expect(() => {
      cases.plugin.register(mockServer);
    }).not.toThrow();
  });

  test("routes array contains all expected route imports", () => {
    const mockServer = {
      route: vi.fn(),
    };

    cases.plugin.register(mockServer);

    const routesArray = mockServer.route.mock.calls[0][0];

    expect(routesArray).toContain(listCasesRoute);
    expect(routesArray).toContain(viewCaseRoute);
    expect(routesArray).toContain(listTasksRoute);
    expect(routesArray).toContain(viewTaskRoute);
    expect(routesArray).toContain(updateTaskStatusRoute);
    expect(routesArray).toContain(completeStageRoute);
    expect(routesArray).toHaveLength(6);
  });

  test("register function can be called multiple times", () => {
    const mockServer1 = {
      route: vi.fn(),
    };
    const mockServer2 = {
      route: vi.fn(),
    };

    cases.plugin.register(mockServer1);
    cases.plugin.register(mockServer2);

    expect(mockServer1.route).toHaveBeenCalledOnce();
    expect(mockServer2.route).toHaveBeenCalledOnce();
  });

  test("plugin name is correctly set", () => {
    expect(cases.plugin.name).toBe("cases");
    expect(cases.plugin.name).not.toBe("");
    expect(cases.plugin.name).not.toBeNull();
    expect(cases.plugin.name).not.toBeUndefined();
  });
});

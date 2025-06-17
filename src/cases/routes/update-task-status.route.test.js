import hapi from "@hapi/hapi";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { updateTaskStatusUseCase } from "../use-cases/update-task-status.use-case.js";
import { updateTaskStatusRoute } from "./update-task-status.route.js";

vi.mock("../use-cases/update-task-status.use-case.js");

describe("updateTaskStatusRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route([updateTaskStatusRoute]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("updates the task status", async () => {
    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/stages/001/task-groups/tg01/tasks/t01/status",
      payload: {
        isComplete: true,
      },
    });

    expect(updateTaskStatusUseCase).toHaveBeenCalledWith({
      caseId: "68495db5afe2d27b09b2ee47",
      stageId: "001",
      taskGroupId: "tg01",
      taskId: "t01",
      isComplete: true,
    });

    expect(statusCode).toEqual(302);
  });
});

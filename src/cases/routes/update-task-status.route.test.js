import hapi from "@hapi/hapi";
import Yar from "@hapi/yar";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { updateTaskStatusUseCase } from "../use-cases/update-task-status.use-case.js";
import { updateTaskStatusRoute } from "./update-task-status.route.js";

vi.mock("../use-cases/find-case-by-id.use-case.js");
vi.mock("../use-cases/update-task-status.use-case.js");

describe("updateTaskStatusRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    await server.register({
      plugin: Yar,
      options: {
        name: "session",
        cookieOptions: {
          password: "abcdefghijklmnopqrstuvwxyz012345",
          isSecure: false,
          isSameSite: "Strict",
        },
      },
    });

    server.route([updateTaskStatusRoute]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("throws if comment is required", async () => {
    findCaseByIdUseCase.mockResolvedValueOnce({
      stages: [
        {
          code: "001",
          taskGroups: [
            {
              id: "tg01",
              tasks: [
                {
                  id: "t01",
                  comment: {
                    type: "REQUIRED",
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/stages/001/task-groups/tg01/tasks/t01/status",
      payload: {
        isComplete: true,
      },
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    expect(updateTaskStatusUseCase).not.toHaveBeenCalled();
    expect(statusCode).toEqual(302);
  });

  it("updates the task status with no comment", async () => {
    findCaseByIdUseCase.mockResolvedValueOnce({
      stages: [
        {
          code: "001",
          taskGroups: [
            {
              id: "tg01",
              tasks: [
                {
                  id: "t01",
                  comment: {
                    type: "OPTIONAL",
                  },
                },
              ],
            },
          ],
        },
      ],
    });
    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/stages/001/task-groups/tg01/tasks/t01/status",
      payload: {
        isComplete: true,
      },
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    const authContext = {
      token: "mock-token",
      user: {},
    };

    expect(updateTaskStatusUseCase).toHaveBeenCalledWith(authContext, {
      caseId: "68495db5afe2d27b09b2ee47",
      stageCode: "001",
      taskGroupId: "tg01",
      taskId: "t01",
      isComplete: true,
      comment: null,
    });

    expect(statusCode).toEqual(302);
  });

  it("updates the task status with comment if required", async () => {
    findCaseByIdUseCase.mockResolvedValueOnce({
      stages: [
        {
          code: "001",
          taskGroups: [
            {
              id: "tg01",
              tasks: [
                {
                  id: "t01",
                  comment: {
                    type: "REQUIRED",
                  },
                },
              ],
            },
          ],
        },
      ],
    });
    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/stages/001/task-groups/tg01/tasks/t01/status",
      payload: {
        isComplete: true,
        comment: "This is a comment",
      },
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    const authContext = {
      token: "mock-token",
      user: {},
    };

    expect(updateTaskStatusUseCase).toHaveBeenCalledWith(authContext, {
      caseId: "68495db5afe2d27b09b2ee47",
      stageCode: "001",
      taskGroupId: "tg01",
      taskId: "t01",
      isComplete: true,
      comment: "This is a comment",
    });

    expect(statusCode).toEqual(302);
  });
});

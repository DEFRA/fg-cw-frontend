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
      phases: [
        {
          code: "phase-1",
          stages: [
            {
              code: "001",
              taskGroups: [
                {
                  code: "tg01",
                  tasks: [
                    {
                      code: "t01",
                      statusOptions: [{ code: "approved" }],
                      commentInputDef: {
                        mandatory: true,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/phases/phase-1/stages/001/task-groups/tg01/tasks/t01/status",
      payload: {
        completed: true,
        status: "approved",
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
      phases: [
        {
          code: "phase-1",
          stages: [
            {
              code: "001",
              taskGroups: [
                {
                  code: "tg01",
                  tasks: [
                    {
                      code: "t01",
                      statusOptions: [{ code: "approved" }],
                      commentInputDef: {
                        mandatory: false,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/phases/phase-1/stages/001/task-groups/tg01/tasks/t01/status",
      payload: {
        completed: true,
        status: "approved",
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
      phaseCode: "phase-1",
      stageCode: "001",
      taskGroupCode: "tg01",
      taskCode: "t01",
      completed: true,
      status: "approved",
      comment: null,
    });

    expect(statusCode).toEqual(302);
  });

  it("updates the task status with comment if required", async () => {
    findCaseByIdUseCase.mockResolvedValueOnce({
      phases: [
        {
          code: "phase-1",
          stages: [
            {
              code: "001",
              taskGroups: [
                {
                  code: "tg01",
                  tasks: [
                    {
                      code: "t01",
                      statusOptions: [{ code: "approved" }],
                      commentInputDef: {
                        mandatory: true,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/phases/phase-1/stages/001/task-groups/tg01/tasks/t01/status",
      payload: {
        completed: true,
        status: "approved",
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
      phaseCode: "phase-1",
      stageCode: "001",
      taskGroupCode: "tg01",
      taskCode: "t01",
      completed: true,
      status: "approved",
      comment: "This is a comment",
    });

    expect(statusCode).toEqual(302);
  });

  it("updates with status value but completed=false", async () => {
    findCaseByIdUseCase.mockResolvedValueOnce({
      phases: [
        {
          code: "phase-1",
          stages: [
            {
              code: "001",
              taskGroups: [
                {
                  code: "tg01",
                  tasks: [
                    {
                      code: "t01",
                      statusOptions: [{ code: "on-hold" }],
                      commentInputDef: null,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/phases/phase-1/stages/001/task-groups/tg01/tasks/t01/status",
      payload: {
        completed: false,
        status: "on-hold",
      },
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    expect(updateTaskStatusUseCase).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        completed: false,
        status: "on-hold",
      }),
    );

    expect(statusCode).toEqual(302);
  });

  it("handles empty string comment correctly", async () => {
    findCaseByIdUseCase.mockResolvedValueOnce({
      phases: [
        {
          code: "phase-1",
          stages: [
            {
              code: "001",
              taskGroups: [
                {
                  code: "tg01",
                  tasks: [
                    {
                      code: "t01",
                      statusOptions: [{ code: "approved" }],
                      commentInputDef: {
                        mandatory: false,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/phases/phase-1/stages/001/task-groups/tg01/tasks/t01/status",
      payload: {
        completed: true,
        status: "approved",
        comment: "",
      },
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    expect(updateTaskStatusUseCase).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        comment: "",
      }),
    );

    expect(statusCode).toEqual(302);
  });

  it("validates when task has no commentInputDef", async () => {
    findCaseByIdUseCase.mockResolvedValueOnce({
      phases: [
        {
          code: "phase-1",
          stages: [
            {
              code: "001",
              taskGroups: [
                {
                  code: "tg01",
                  tasks: [
                    {
                      code: "t01",
                      statusOptions: [{ code: "approved" }],
                      // No commentInputDef
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/phases/phase-1/stages/001/task-groups/tg01/tasks/t01/status",
      payload: {
        completed: true,
        status: "approved",
      },
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    // Should not throw error for missing commentInputDef
    expect(updateTaskStatusUseCase).toHaveBeenCalled();
    expect(statusCode).toEqual(302);
  });

  it("rejects when mandatory comment is undefined (not just empty)", async () => {
    findCaseByIdUseCase.mockResolvedValueOnce({
      phases: [
        {
          code: "phase-1",
          stages: [
            {
              code: "001",
              taskGroups: [
                {
                  code: "tg01",
                  tasks: [
                    {
                      code: "t01",
                      statusOptions: [{ code: "approved" }],
                      commentInputDef: {
                        mandatory: true,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/phases/phase-1/stages/001/task-groups/tg01/tasks/t01/status",
      payload: {
        completed: true,
        status: "approved",
        // comment is undefined (not sent)
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
    expect(statusCode).toEqual(302); // Redirects back to form
  });

  it("rejects when status is required but missing", async () => {
    findCaseByIdUseCase.mockResolvedValueOnce({
      phases: [
        {
          code: "phase-1",
          stages: [
            {
              code: "001",
              taskGroups: [
                {
                  code: "tg01",
                  tasks: [
                    {
                      code: "t01",
                      statusOptions: [
                        { code: "approved" },
                        { code: "rejected" },
                      ],
                      commentInputDef: null,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/phases/phase-1/stages/001/task-groups/tg01/tasks/t01/status",
      payload: {
        completed: true,
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
});

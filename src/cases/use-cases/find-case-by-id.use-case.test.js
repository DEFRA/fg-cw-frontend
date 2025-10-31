import { describe, expect, test, vi } from "vitest";
import { findById } from "../repositories/case.repository.js";
import { findCaseByIdUseCase } from "./find-case-by-id.use-case.js";

vi.mock("../repositories/case.repository.js");

describe("findCaseByIdUseCase", () => {
  const authContext = {
    profile: {
      oid: "12345678-1234-1234-1234-123456789012",
      email: "bob.bill@defra.gov.uk",
      name: "Bob Bill",
      roles: ["FCP.Casework.Read"],
    },
  };
  test("returns case when repository succeeds", async () => {
    const caseId = "case-123";
    const mockCase = {
      _id: "case-123",
      clientRef: "client-ref-123",
      code: "case-code-123",
      workflowCode: "workflow-123",
      currentStage: "stage-1",
      phases: [
        {
          code: "phase-1",
          stages: [
            {
              code: "stage-1",
              name: "Initial Stage",
              taskGroups: [
                {
                  code: "taskgroup-1",
                  name: "First Task Group",
                  tasks: [
                    {
                      code: "task-1",
                      name: "First Task",
                      type: "text",
                      status: "pending",
                    },
                  ],
                },
              ],
              actions: ["submit", "cancel"],
            },
          ],
        },
      ],
      createdAt: "2021-01-01T00:00:00.000Z",
      submittedAt: "2021-01-15T10:30:00.000Z",
      status: "In Progress",
      assignedUser: "john doe",
    };

    const expectedResult = {
      _id: "case-123",
      clientRef: "client-ref-123",
      code: "case-code-123",
      workflowCode: "workflow-123",
      currentStage: "stage-1",
      phases: [
        {
          code: "phase-1",
          stages: [
            {
              code: "stage-1",
              name: "Initial Stage",
              actions: ["submit", "cancel"],
              taskGroups: [
                {
                  code: "taskgroup-1",
                  name: "First Task Group",
                  tasks: [
                    {
                      code: "task-1",
                      name: "First Task",
                      type: "text",
                      status: "pending",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      createdAt: "2021-01-01T00:00:00.000Z",
      submittedAt: "2021-01-15T10:30:00.000Z",
      status: "In Progress",
      assignedUser: "john doe",
    };

    findById.mockResolvedValueOnce(mockCase);

    const result = await findCaseByIdUseCase(authContext, caseId);

    expect(findById).toHaveBeenCalledOnce();
    expect(findById).toHaveBeenCalledWith(authContext, caseId);
    expect(result).toEqual(expectedResult);
  });

  test("handles case with multiple stages and task groups", async () => {
    const caseId = "case-456";
    const mockCase = {
      _id: "case-456",
      workflowCode: "workflow-456",
      banner: null,
      phases: [
        {
          code: "phase-1",
          name: "Stage One",
          actions: [],
          stages: [
            {
              code: "stage-1",
              taskGroups: [
                {
                  code: "taskgroup-1",
                  name: "Task Group One",
                  tasks: [
                    {
                      code: "task-1",
                      name: "Task One",
                      type: "boolean",
                      status: "completed",
                    },
                  ],
                },
                {
                  code: "taskgroup-2",
                  name: "Task Group Two",
                  tasks: [
                    {
                      code: "task-2",
                      name: "Task Two",
                      type: "text",
                      status: "pending",
                    },
                  ],
                },
              ],
            },
            {
              code: "stage-2",
              actions: [],
              taskGroups: [
                {
                  code: "taskgroup-3",
                  tasks: [
                    {
                      code: "task-3",
                      name: "Task Three",
                      type: "file",
                      status: "not-started",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    findById.mockResolvedValueOnce(mockCase);

    const result = await findCaseByIdUseCase(authContext, caseId);

    expect(result).toEqual({
      _id: "case-456",
      banner: null,
      phases: [
        {
          actions: [],
          code: "phase-1",
          name: "Stage One",
          stages: [
            {
              code: "stage-1",
              taskGroups: [
                {
                  code: "taskgroup-1",
                  name: "Task Group One",
                  tasks: [
                    {
                      code: "task-1",
                      name: "Task One",
                      status: "completed",
                      type: "boolean",
                    },
                  ],
                },
                {
                  code: "taskgroup-2",
                  name: "Task Group Two",
                  tasks: [
                    {
                      code: "task-2",
                      name: "Task Two",
                      status: "pending",
                      type: "text",
                    },
                  ],
                },
              ],
            },
            {
              actions: [],
              code: "stage-2",
              taskGroups: [
                {
                  code: "taskgroup-3",
                  tasks: [
                    {
                      code: "task-3",
                      name: "Task Three",
                      status: "not-started",
                      type: "file",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      workflowCode: "workflow-456",
    });
  });

  test("propagates error when case repository throws", async () => {
    const caseId = "case-123";
    const error = new Error("Case repository failed");

    findById.mockRejectedValueOnce(error);

    await expect(findCaseByIdUseCase(authContext, caseId)).rejects.toThrow(
      "Case repository failed",
    );
    expect(findById).toHaveBeenCalledOnce();
    expect(findById).toHaveBeenCalledWith(authContext, caseId);
  });

  test("handles case with empty stages", async () => {
    const caseId = "case-empty";
    const mockCase = {
      _id: "case-empty",
      workflowCode: "workflow-empty",
      stages: [],
    };

    findById.mockResolvedValueOnce(mockCase);

    const result = await findCaseByIdUseCase(authContext, caseId);

    expect(result.stages).toEqual([]);
    expect(findById).toHaveBeenCalledWith(authContext, caseId);
  });

  test("calls repositories with correct parameters", async () => {
    const caseId = "specific-case-id";
    const mockCase = {
      _id: caseId,
      workflowCode: "specific-workflow-code",
      stages: [],
    };

    findById.mockResolvedValueOnce(mockCase);

    await findCaseByIdUseCase(authContext, caseId);

    expect(findById).toHaveBeenCalledWith(authContext, caseId);
  });
});

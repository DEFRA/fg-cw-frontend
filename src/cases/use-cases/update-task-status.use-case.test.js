import { describe, expect, test, vi } from "vitest";
import { updateTaskStatus } from "../repositories/case.repository.js";
import { updateTaskStatusUseCase } from "./update-task-status.use-case.js";

vi.mock("../repositories/case.repository.js");

describe("updateTaskStatusUseCase", () => {
  const authContext = {
    profile: {
      oid: "12345678-1234-1234-1234-123456789012",
      email: "bob.bill@defra.gov.uk",
      name: "Bob Bill",
      roles: ["FCP.Casework.Read"],
    },
  };
  test("returns updated task when repository succeeds", async () => {
    const mockData = {
      caseId: "case-123",
      taskId: "task-456",
      status: "completed",
    };

    const mockResult = {
      _id: "case-123",
      clientRef: "client-ref-123",
      code: "case-code-123",
      workflowCode: "workflow-123",
      currentStage: "stage-1",
      stages: [
        {
          code: "stage-1",
          taskGroups: [
            {
              id: "taskgroup-1",
              tasks: [
                {
                  id: "task-456",
                  status: "completed",
                  updatedAt: "2021-01-15T10:30:00.000Z",
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

    updateTaskStatus.mockResolvedValueOnce(mockResult);

    const result = await updateTaskStatusUseCase(authContext, mockData);

    expect(updateTaskStatus).toHaveBeenCalledOnce();
    expect(updateTaskStatus).toHaveBeenCalledWith(authContext, mockData);
    expect(result).toEqual(mockResult);
  });

  test("handles different task status values", async () => {
    const mockData = {
      caseId: "case-789",
      taskId: "task-101",
      status: "in-progress",
    };

    const mockResult = {
      _id: "case-789",
      stages: [
        {
          taskGroups: [
            {
              tasks: [
                {
                  id: "task-101",
                  status: "in-progress",
                },
              ],
            },
          ],
        },
      ],
    };

    updateTaskStatus.mockResolvedValueOnce(mockResult);

    const result = await updateTaskStatusUseCase(authContext, mockData);

    expect(updateTaskStatus).toHaveBeenCalledWith(authContext, mockData);
    expect(result).toEqual(mockResult);
  });

  test("handles empty data object", async () => {
    const mockData = {};
    const mockResult = null;

    updateTaskStatus.mockResolvedValueOnce(mockResult);

    const result = await updateTaskStatusUseCase(authContext, mockData);

    expect(updateTaskStatus).toHaveBeenCalledWith(authContext, mockData);
    expect(result).toBeNull();
  });

  test("handles null data parameter", async () => {
    const mockData = null;
    const mockResult = null;

    updateTaskStatus.mockResolvedValueOnce(mockResult);

    const result = await updateTaskStatusUseCase(authContext, mockData);

    expect(updateTaskStatus).toHaveBeenCalledWith(authContext, null);
    expect(result).toBeNull();
  });

  test("calls repository with exact data parameter", async () => {
    const mockData = {
      caseId: "specific-case",
      taskId: "specific-task",
      status: "pending",
      customField: "custom-value",
    };
    const mockResult = { updated: true };

    updateTaskStatus.mockResolvedValueOnce(mockResult);

    await updateTaskStatusUseCase(authContext, mockData);

    expect(updateTaskStatus).toHaveBeenCalledWith(authContext, mockData);
  });
});

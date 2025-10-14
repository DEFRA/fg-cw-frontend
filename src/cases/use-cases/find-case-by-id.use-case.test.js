import { describe, expect, test, vi } from "vitest";
import { findById } from "../repositories/case.repository.js";
import { findByCode } from "../repositories/workflow.repository.js";
import { findCaseByIdUseCase } from "./find-case-by-id.use-case.js";

vi.mock("../repositories/case.repository.js");
vi.mock("../repositories/workflow.repository.js");

describe("findCaseByIdUseCase", () => {
  const authContext = {
    profile: {
      oid: "12345678-1234-1234-1234-123456789012",
      email: "bob.bill@defra.gov.uk",
      name: "Bob Bill",
      roles: ["FCP.Casework.Read"],
    },
  };
  test("returns case with titles when both repositories succeed", async () => {
    const caseId = "case-123";
    const mockCase = {
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
              code: "taskgroup-1",
              tasks: [
                {
                  id: "task-1",
                  status: "pending",
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

    const mockWorkflow = {
      code: "workflow-123",
      stages: [
        {
          code: "stage-1",
          name: "Initial Stage",
          actions: ["submit", "cancel"],
          taskGroups: [
            {
              code: "taskgroup-1",
              title: "First Task Group",
              tasks: [
                {
                  id: "task-1",
                  title: "First Task",
                  type: "text",
                },
              ],
            },
          ],
        },
      ],
      pages: {
        cases: {
          details: {
            tabs: {
              tasks: { title: "Custom Tasks" },
              caseDetails: { title: "Case Info" },
              customTab: { title: "Custom Tab" },
            },
          },
        },
      },
    };

    const expectedResult = {
      _id: "case-123",
      clientRef: "client-ref-123",
      code: "case-code-123",
      workflowCode: "workflow-123",
      currentStage: "stage-1",
      stages: [
        {
          code: "stage-1",
          name: "Initial Stage",
          actions: ["submit", "cancel"],
          taskGroups: [
            {
              code: "taskgroup-1",
              title: "First Task Group",
              tasks: [
                {
                  id: "task-1",
                  title: "First Task",
                  type: "text",
                  status: "pending",
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
      overrideTabs: [
        { id: "tasks", title: "Custom Tasks" },
        { id: "caseDetails", title: "Case Info" },
      ],
      customTabs: [{ id: "customTab", title: "Custom Tab" }],
    };

    findById.mockResolvedValueOnce(mockCase);
    findByCode.mockResolvedValueOnce(mockWorkflow);

    const result = await findCaseByIdUseCase(authContext, caseId);

    expect(findById).toHaveBeenCalledOnce();
    expect(findById).toHaveBeenCalledWith(authContext, caseId);
    expect(findByCode).toHaveBeenCalledOnce();
    expect(findByCode).toHaveBeenCalledWith(authContext, "workflow-123");
    expect(result).toEqual(expectedResult);
  });

  test("handles case with multiple stages and task groups", async () => {
    const caseId = "case-456";
    const mockCase = {
      _id: "case-456",
      workflowCode: "workflow-456",
      stages: [
        {
          code: "stage-1",
          taskGroups: [
            {
              code: "taskgroup-1",
              tasks: [{ id: "task-1", status: "completed" }],
            },
            {
              code: "taskgroup-2",
              tasks: [{ id: "task-2", status: "pending" }],
            },
          ],
        },
        {
          code: "stage-2",
          taskGroups: [
            {
              code: "taskgroup-3",
              tasks: [{ id: "task-3", status: "not-started" }],
            },
          ],
        },
      ],
    };

    const mockWorkflow = {
      code: "workflow-456",
      stages: [
        {
          code: "stage-1",
          name: "Stage One",
          actions: ["next"],
          taskGroups: [
            {
              code: "taskgroup-1",
              title: "Task Group One",
              tasks: [{ id: "task-1", title: "Task One", type: "boolean" }],
            },
            {
              code: "taskgroup-2",
              title: "Task Group Two",
              tasks: [{ id: "task-2", title: "Task Two", type: "text" }],
            },
          ],
        },
        {
          code: "stage-2",
          name: "Stage Two",
          actions: ["complete"],
          taskGroups: [
            {
              code: "taskgroup-3",
              title: "Task Group Three",
              tasks: [{ id: "task-3", title: "Task Three", type: "file" }],
            },
          ],
        },
      ],
      pages: {
        cases: {
          details: {
            tabs: {
              tasks: { title: "Tasks List" },
              timeline: { title: "Timeline View" },
            },
          },
        },
      },
    };

    findById.mockResolvedValueOnce(mockCase);
    findByCode.mockResolvedValueOnce(mockWorkflow);

    const result = await findCaseByIdUseCase(authContext, caseId);

    expect(result.stages).toHaveLength(2);
    expect(result.stages[0].name).toBe("Stage One");
    expect(result.stages[0].taskGroups).toHaveLength(2);
    expect(result.stages[1].name).toBe("Stage Two");
    expect(result.stages[1].taskGroups[0].tasks[0].title).toBe("Task Three");
    expect(result.overrideTabs).toEqual([
      { id: "tasks", title: "Tasks List" },
      { id: "timeline", title: "Timeline View" },
    ]);
    expect(result.customTabs).toEqual([]);
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
    expect(findByCode).not.toHaveBeenCalled();
  });

  test("propagates error when workflow repository throws", async () => {
    const caseId = "case-123";
    const mockCase = {
      _id: "case-123",
      workflowCode: "workflow-123",
      stages: [],
    };
    const error = new Error("Workflow repository failed");

    findById.mockResolvedValueOnce(mockCase);
    findByCode.mockRejectedValueOnce(error);

    await expect(findCaseByIdUseCase(authContext, caseId)).rejects.toThrow(
      "Workflow repository failed",
    );
    expect(findById).toHaveBeenCalledOnce();
    expect(findByCode).toHaveBeenCalledOnce();
    expect(findByCode).toHaveBeenCalledWith(authContext, "workflow-123");
  });

  test("handles case with empty stages", async () => {
    const caseId = "case-empty";
    const mockCase = {
      _id: "case-empty",
      workflowCode: "workflow-empty",
      stages: [],
    };

    const mockWorkflow = {
      code: "workflow-empty",
      stages: [],
      pages: {
        cases: {
          details: {
            tabs: {},
          },
        },
      },
    };

    findById.mockResolvedValueOnce(mockCase);
    findByCode.mockResolvedValueOnce(mockWorkflow);

    const result = await findCaseByIdUseCase(authContext, caseId);

    expect(result.stages).toEqual([]);
    expect(result.overrideTabs).toEqual([]);
    expect(result.customTabs).toEqual([]);
    expect(findById).toHaveBeenCalledWith(authContext, caseId);
    expect(findByCode).toHaveBeenCalledWith(authContext, "workflow-empty");
  });

  test("calls repositories with correct parameters", async () => {
    const caseId = "specific-case-id";
    const mockCase = {
      _id: caseId,
      workflowCode: "specific-workflow-code",
      stages: [],
    };
    const mockWorkflow = {
      code: "specific-workflow-code",
      stages: [],
      pages: {
        cases: {
          details: {
            tabs: {
              tasks: { title: "Tasks" },
            },
          },
        },
      },
    };

    findById.mockResolvedValueOnce(mockCase);
    findByCode.mockResolvedValueOnce(mockWorkflow);

    const result = await findCaseByIdUseCase(authContext, caseId);

    expect(findById).toHaveBeenCalledWith(authContext, caseId);
    expect(findByCode).toHaveBeenCalledWith(
      authContext,
      "specific-workflow-code",
    );
    expect(result.overrideTabs).toEqual([{ id: "tasks", title: "Tasks" }]);
    expect(result.customTabs).toEqual([]);
  });
});

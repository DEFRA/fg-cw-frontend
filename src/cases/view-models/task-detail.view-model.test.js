import { describe, expect, it, vi } from "vitest";
import {
  checkTaskAccess,
  createTaskDetailViewModel,
  hasAllRequiredRoles,
  hasAnyRequiredRole,
} from "./task-detail.view-model.js";

vi.mock("../../common/helpers/date-helpers.js", () => ({
  getFormattedGBDate: vi.fn((date) => `formatted-${date}`),
}));

vi.mock("../../common/helpers/navigation-helpers.js", () => ({
  setActiveLink: vi.fn((links, activeId) =>
    links.map((link) => ({ ...link, active: link.id === activeId })),
  ),
}));

describe("hasAllRequiredRoles", () => {
  it("should return true when allOf is empty", () => {
    const userRoles = ["role1", "role2"];
    const allOf = [];

    expect(hasAllRequiredRoles(userRoles, allOf)).toBe(true);
  });

  it("should return true when user has all required roles", () => {
    const userRoles = ["role1", "role2", "role3"];
    const allOf = ["role1", "role2"];

    expect(hasAllRequiredRoles(userRoles, allOf)).toBe(true);
  });

  it("should return false when user is missing some required roles", () => {
    const userRoles = ["role1"];
    const allOf = ["role1", "role2"];

    expect(hasAllRequiredRoles(userRoles, allOf)).toBe(false);
  });

  it("should return false when user has no roles but roles are required", () => {
    const userRoles = [];
    const allOf = ["role1"];

    expect(hasAllRequiredRoles(userRoles, allOf)).toBe(false);
  });
});

describe("hasAnyRequiredRole", () => {
  it("should return true when anyOf is empty", () => {
    const userRoles = ["role1", "role2"];
    const anyOf = [];

    expect(hasAnyRequiredRole(userRoles, anyOf)).toBe(true);
  });

  it("should return true when user has at least one required role", () => {
    const userRoles = ["role1"];
    const anyOf = ["role1", "role2"];

    expect(hasAnyRequiredRole(userRoles, anyOf)).toBe(true);
  });

  it("should return false when user has none of the required roles", () => {
    const userRoles = ["role3"];
    const anyOf = ["role1", "role2"];

    expect(hasAnyRequiredRole(userRoles, anyOf)).toBe(false);
  });

  it("should return false when user has no roles but roles are required", () => {
    const userRoles = [];
    const anyOf = ["role1"];

    expect(hasAnyRequiredRole(userRoles, anyOf)).toBe(false);
  });
});

describe("checkTaskAccess", () => {
  it("should return true when both allOf and anyOf conditions are met", () => {
    const appRoles = {
      role1: {
        startDate: "2025-01-31",
        endDate: "2025-10-31",
      },
      role2: {
        startDate: "2025-01-31",
        endDate: "2025-10-31",
      },
      role3: {
        startDate: "2025-01-31",
        endDate: "2025-10-31",
      },
    };

    const taskRequiredRoles = { allOf: ["role1", "role2"], anyOf: ["role3"] };

    expect(checkTaskAccess(appRoles, taskRequiredRoles)).toBe(true);
  });

  it("should return false when allOf condition is not met", () => {
    const appRoles = {
      role1: {
        startDate: "2025-01-31",
        endDate: "2025-10-31",
      },
    };

    const taskRequiredRoles = { allOf: ["role1", "role2"], anyOf: [] };

    expect(checkTaskAccess(appRoles, taskRequiredRoles)).toBe(false);
  });

  it("should return false when anyOf condition is not met", () => {
    const appRoles = {
      role1: {
        startDate: "2025-01-31",
        endDate: "2025-10-31",
      },
      role2: {
        startDate: "2025-01-31",
        endDate: "2025-10-31",
      },
    };
    const taskRequiredRoles = { allOf: ["role1"], anyOf: ["role3"] };

    expect(checkTaskAccess(appRoles, taskRequiredRoles)).toBe(false);
  });

  it("should handle missing allOf and anyOf properties", () => {
    const appRoles = {
      role1: {
        startDate: "2025-01-31",
        endDate: "2025-10-31",
      },
    };

    const taskRequiredRoles = {};

    expect(checkTaskAccess(appRoles, taskRequiredRoles)).toBe(true);
  });

  it("should handle empty arrays", () => {
    const appRoles = {
      role1: {
        startDate: "2025-01-31",
        endDate: "2025-10-31",
      },
    };
    const taskRequiredRoles = { allOf: [], anyOf: [] };

    expect(checkTaskAccess(appRoles, taskRequiredRoles)).toBe(true);
  });
});

describe("createTaskDetailViewModel", () => {
  const mockCaseData = {
    _id: "case123",
    caseRef: "REF123",
    workflowCode: "workflow1",
    currentPhase: "phase1",
    currentStage: "stage1",
    currentStatus: "active",
    dateReceived: "2024-01-01",
    assignedUser: "user123",
    banner: { type: "info", message: "Test banner" },
    links: [
      { id: "tasks", text: "Tasks", href: "/tasks" },
      { id: "details", text: "Details", href: "/details" },
    ],
    payload: {
      submittedAt: "2024-01-01T10:00:00Z",
      identifiers: { sbi: "SBI123" },
      answers: { scheme: "Test Scheme" },
    },
    stage: {
      code: "stage1",
      taskGroups: [
        {
          code: "group1",
          tasks: [
            {
              code: "task1",
              status: "complete",
              commentRef: "comment1",
              requiredRoles: { allOf: ["role1"], anyOf: [] },
            },
          ],
        },
      ],
    },
    comments: [{ ref: "comment1", text: "Test comment" }],
  };

  const mockQuery = {
    taskGroupCode: "group1",
    taskCode: "task1",
  };

  const mockRoles = { role1: true, role2: true };
  const mockErrors = { field1: "Error message" };

  it("should create a complete view model", () => {
    const result = createTaskDetailViewModel(
      mockCaseData,
      mockQuery,
      mockRoles,
      mockErrors,
    );

    expect(result).toHaveProperty("errorList", ["Error message"]);
    expect(result).toHaveProperty("pageTitle", "Case task");
    expect(result).toHaveProperty("pageHeading", "Case");

    expect(result.breadcrumbs).toEqual([
      { text: "Cases", href: "/cases" },
      { text: "REF123", href: "/cases/case123" },
    ]);

    expect(result.data).toHaveProperty("banner", mockCaseData.banner);
    expect(result.data).toHaveProperty("caseId", "case123");
    expect(result.data).toHaveProperty("currentTask");
  });

  it("should format case data correctly", () => {
    const result = createTaskDetailViewModel(
      mockCaseData,
      mockQuery,
      mockRoles,
      mockErrors,
    );

    expect(result.data.caseId).toEqual("case123");
    expect(result.data.banner).toEqual(mockCaseData.banner);
  });

  it("should format current task correctly for complete task", () => {
    const result = createTaskDetailViewModel(
      mockCaseData,
      mockQuery,
      mockRoles,
      mockErrors,
    );

    expect(result.data.currentTask).toMatchObject({
      status: "complete",
      canCompleteTask: true,
      formAction: "/cases/case123/task-groups/group1/tasks/task1/status",
    });
  });

  it("should format current task correctly for incomplete task", () => {
    const incompleteCaseData = structuredClone(mockCaseData);

    incompleteCaseData.stage.taskGroups[0].tasks[0].status = "incomplete";

    const result = createTaskDetailViewModel(
      incompleteCaseData,
      mockQuery,
      mockRoles,
      mockErrors,
    );

    expect(result.data.currentTask).toMatchObject({
      status: "incomplete",
    });
  });

  it("should handle missing comment", () => {
    const caseDataNoComment = structuredClone(mockCaseData);

    caseDataNoComment.comments = [];
    caseDataNoComment.stage.taskGroups[0].tasks[0].commentRef = "nonexistent";

    const result = createTaskDetailViewModel(
      caseDataNoComment,
      mockQuery,
      mockRoles,
      mockErrors,
    );

    expect(result.data.currentTask.comment).toBeNull();
  });

  it("should handle missing payload identifiers", () => {
    const caseDataNoIdentifiers = {
      ...mockCaseData,
      payload: {
        ...mockCaseData.payload,
        identifiers: undefined,
      },
    };

    const result = createTaskDetailViewModel(
      caseDataNoIdentifiers,
      mockQuery,
      mockRoles,
      mockErrors,
    );

    // View model no longer exposes case.sbi directly
    expect(result.data.caseId).toBe("case123");
  });

  it("should handle missing payload answers", () => {
    const caseDataNoAnswers = {
      ...mockCaseData,
      payload: {
        ...mockCaseData.payload,
        answers: undefined,
      },
    };

    const result = createTaskDetailViewModel(
      caseDataNoAnswers,
      mockQuery,
      mockRoles,
      mockErrors,
    );

    // View model no longer exposes case.scheme directly
    expect(result.data.caseId).toBe("case123");
  });

  it("should check task access correctly", () => {
    const rolesWithoutAccess = { role2: true };
    const result = createTaskDetailViewModel(
      mockCaseData,
      mockQuery,
      rolesWithoutAccess,
      mockErrors,
    );

    expect(result.data.currentTask.canCompleteTask).toBe(false);
  });

  it("should call helper functions with correct parameters", async () => {
    const { setActiveLink } = vi.mocked(
      await import("../../common/helpers/navigation-helpers.js"),
    );

    createTaskDetailViewModel(mockCaseData, mockQuery, mockRoles, mockErrors);

    // getFormattedGBDate is no longer called in the simplified view model
    expect(setActiveLink).toHaveBeenCalledWith(mockCaseData.links, "tasks");
  });

  it("should set isInteractive to true when stage.interactive is true", () => {
    const interactiveCaseData = {
      ...mockCaseData,
      stage: {
        ...mockCaseData.stage,
        interactive: true,
      },
    };

    const result = createTaskDetailViewModel(
      interactiveCaseData,
      mockQuery,
      mockRoles,
      mockErrors,
    );

    expect(result.data.isInteractive).toBe(true);
  });

  it("should set isInteractive to false when stage.interactive is false", () => {
    const nonInteractiveCaseData = {
      ...mockCaseData,
      stage: {
        ...mockCaseData.stage,
        interactive: false,
      },
    };

    const result = createTaskDetailViewModel(
      nonInteractiveCaseData,
      mockQuery,
      mockRoles,
      mockErrors,
    );

    expect(result.data.isInteractive).toBe(false);
  });

  it("should default isInteractive to true when stage.interactive is not provided", () => {
    const result = createTaskDetailViewModel(
      mockCaseData,
      mockQuery,
      mockRoles,
      mockErrors,
    );

    expect(result.data.isInteractive).toBe(true);
  });

  it("should default isInteractive to true when stage.interactive is undefined", () => {
    const caseDataWithUndefinedInteractive = {
      ...mockCaseData,
      stage: {
        ...mockCaseData.stage,
        interactive: undefined,
      },
    };

    const result = createTaskDetailViewModel(
      caseDataWithUndefinedInteractive,
      mockQuery,
      mockRoles,
      mockErrors,
    );

    expect(result.data.isInteractive).toBe(true);
  });

  it("should handle empty errorList when errors is undefined", () => {
    const result = createTaskDetailViewModel(
      mockCaseData,
      mockQuery,
      mockRoles,
      undefined,
    );

    expect(result.errorList).toEqual([]);
  });

  it("should map status options with comment fields", () => {
    const caseWithStatusOptions = {
      ...mockCaseData,
      stage: {
        code: "stage1",
        taskGroups: [
          {
            code: "group1",
            tasks: [
              {
                code: "task1",
                status: "in_progress",
                commentRef: "comment1",
                requiredRoles: { allOf: ["role1"], anyOf: [] },
                statusOptions: [
                  { code: "in_progress", name: "In Progress" },
                  { code: "complete", name: "Complete" },
                  { code: "rejected", name: "Rejected" },
                ],
                commentInputDef: {
                  label: "Add a comment",
                  helpText: "Explain your decision",
                  mandatory: true,
                },
              },
            ],
          },
        ],
      },
    };

    const result = createTaskDetailViewModel(
      caseWithStatusOptions,
      mockQuery,
      mockRoles,
    );

    expect(result.data.currentTask.statusOptions).toHaveLength(3);
    expect(result.data.currentTask.statusOptions[0]).toMatchObject({
      value: "in_progress",
      text: "In Progress",
      checked: true,
    });
    expect(result.data.currentTask.statusOptions[0].conditional).toMatchObject({
      id: "in_progress-comment",
      name: "in_progress-comment",
      label: { text: "Add a comment" },
      hint: { text: "Explain your decision" },
      required: true,
      rows: 5,
    });
  });

  it("should populate comment field from formData on validation error", () => {
    const caseWithStatusOptions = {
      ...mockCaseData,
      stage: {
        code: "stage1",
        taskGroups: [
          {
            code: "group1",
            tasks: [
              {
                code: "task1",
                status: "complete",
                commentRef: null,
                statusOptions: [
                  { code: "complete", name: "Complete" },
                  { code: "rejected", name: "Rejected" },
                ],
                commentInputDef: {
                  label: "Add a comment",
                  mandatory: true,
                },
              },
            ],
          },
        ],
      },
    };

    const formData = {
      status: "rejected",
      "rejected-comment": "User entered text before validation error",
    };

    const errors = {
      "rejected-comment": "Comment is too short",
    };

    const result = createTaskDetailViewModel(
      caseWithStatusOptions,
      mockQuery,
      mockRoles,
      errors,
      formData,
    );

    const rejectedOption = result.data.currentTask.statusOptions.find(
      (opt) => opt.value === "rejected",
    );

    expect(rejectedOption.conditional.value).toBe(
      "User entered text before validation error",
    );
    expect(rejectedOption.conditional.errorMessage).toBe(
      "Comment is too short",
    );
  });

  it("should populate comment field from existing task comment", () => {
    const caseWithStatusOptions = {
      ...mockCaseData,
      stage: {
        code: "stage1",
        taskGroups: [
          {
            code: "group1",
            tasks: [
              {
                code: "task1",
                status: "complete",
                commentRef: "comment1",
                statusOptions: [
                  { code: "complete", name: "Complete" },
                  { code: "rejected", name: "Rejected" },
                ],
                commentInputDef: {
                  label: "Add a comment",
                  mandatory: true,
                },
              },
            ],
          },
        ],
      },
      comments: [{ ref: "comment1", text: "Existing task comment" }],
    };

    const result = createTaskDetailViewModel(
      caseWithStatusOptions,
      mockQuery,
      mockRoles,
    );

    const completeOption = result.data.currentTask.statusOptions.find(
      (opt) => opt.value === "complete",
    );

    expect(completeOption.conditional.value).toBe("Existing task comment");
  });

  it("should handle existing comment with empty text", () => {
    const caseWithStatusOptions = {
      ...mockCaseData,
      stage: {
        code: "stage1",
        taskGroups: [
          {
            code: "group1",
            tasks: [
              {
                code: "task1",
                status: "complete",
                commentRef: "comment1",
                statusOptions: [
                  { code: "complete", name: "Complete" },
                  { code: "rejected", name: "Rejected" },
                ],
                commentInputDef: {
                  label: "Add a comment",
                  mandatory: true,
                },
              },
            ],
          },
        ],
      },
      comments: [{ ref: "comment1", text: null }],
    };

    const result = createTaskDetailViewModel(
      caseWithStatusOptions,
      mockQuery,
      mockRoles,
    );

    const completeOption = result.data.currentTask.statusOptions.find(
      (opt) => opt.value === "complete",
    );

    expect(completeOption.conditional.value).toBe("");
  });

  it("should handle status options without comment input definition", () => {
    const caseWithStatusOptions = {
      ...mockCaseData,
      stage: {
        code: "stage1",
        taskGroups: [
          {
            code: "group1",
            tasks: [
              {
                code: "task1",
                status: "in_progress",
                commentRef: null,
                statusOptions: [
                  { code: "in_progress", name: "In Progress" },
                  { code: "complete", name: "Complete" },
                ],
                commentInputDef: null,
              },
            ],
          },
        ],
      },
    };

    const result = createTaskDetailViewModel(
      caseWithStatusOptions,
      mockQuery,
      mockRoles,
    );

    expect(result.data.currentTask.statusOptions).toHaveLength(2);
    expect(
      result.data.currentTask.statusOptions[0].conditional,
    ).toBeUndefined();
    expect(
      result.data.currentTask.statusOptions[1].conditional,
    ).toBeUndefined();
  });

  it("should handle empty status options array", () => {
    const caseWithEmptyOptions = {
      ...mockCaseData,
      stage: {
        code: "stage1",
        taskGroups: [
          {
            code: "group1",
            tasks: [
              {
                code: "task1",
                status: "complete",
                commentRef: null,
                statusOptions: [],
              },
            ],
          },
        ],
      },
    };

    const result = createTaskDetailViewModel(
      caseWithEmptyOptions,
      mockQuery,
      mockRoles,
    );

    expect(result.data.currentTask.statusOptions).toEqual([]);
  });

  it("should handle comment input without helpText", () => {
    const caseWithStatusOptions = {
      ...mockCaseData,
      stage: {
        code: "stage1",
        taskGroups: [
          {
            code: "group1",
            tasks: [
              {
                code: "task1",
                status: "complete",
                commentRef: null,
                statusOptions: [{ code: "complete", name: "Complete" }],
                commentInputDef: {
                  label: "Add a comment",
                  mandatory: false,
                },
              },
            ],
          },
        ],
      },
    };

    const result = createTaskDetailViewModel(
      caseWithStatusOptions,
      mockQuery,
      mockRoles,
    );

    const option = result.data.currentTask.statusOptions[0];
    expect(option.conditional.hint).toBeUndefined();
    expect(option.conditional.required).toBe(false);
  });

  it("should override current status from formData", () => {
    const caseWithStatusOptions = {
      ...mockCaseData,
      stage: {
        code: "stage1",
        taskGroups: [
          {
            code: "group1",
            tasks: [
              {
                code: "task1",
                status: "in_progress",
                commentRef: null,
                statusOptions: [
                  { code: "in_progress", name: "In Progress" },
                  { code: "complete", name: "Complete" },
                ],
              },
            ],
          },
        ],
      },
    };

    const formData = { status: "complete" };

    const result = createTaskDetailViewModel(
      caseWithStatusOptions,
      mockQuery,
      mockRoles,
      undefined,
      formData,
    );

    expect(result.data.currentTask.status).toBe("complete");
    const completeOption = result.data.currentTask.statusOptions.find(
      (opt) => opt.value === "complete",
    );
    expect(completeOption.checked).toBe(true);

    const inProgressOption = result.data.currentTask.statusOptions.find(
      (opt) => opt.value === "in_progress",
    );
    expect(inProgressOption.checked).toBe(false);
  });

  it("should preserve completed field from formData", () => {
    const formData = { completed: true };

    const result = createTaskDetailViewModel(
      mockCaseData,
      mockQuery,
      mockRoles,
      undefined,
      formData,
    );

    expect(result.data.currentTask.completed).toBe(true);
  });

  it("should use task completed value when formData is not provided", () => {
    const caseWithCompletedTask = {
      ...mockCaseData,
      stage: {
        code: "stage1",
        taskGroups: [
          {
            code: "group1",
            tasks: [
              {
                code: "task1",
                status: "complete",
                completed: true,
                commentRef: null,
              },
            ],
          },
        ],
      },
    };

    const result = createTaskDetailViewModel(
      caseWithCompletedTask,
      mockQuery,
      mockRoles,
    );

    expect(result.data.currentTask.completed).toBe(true);
  });
});

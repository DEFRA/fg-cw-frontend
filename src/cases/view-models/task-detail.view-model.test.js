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

    expect(result).toHaveProperty("errorList", mockErrors);
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
});

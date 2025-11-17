import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("task-details", () => {
  test("renders", () => {
    const component = render("task-details", {
      caseId: "case-id",
      phaseCode: "phase-1",
      stageCode: "strage-id",
      taskGroupCode: "task-group-code",
      taskCode: "task-id",
      currentTask: {
        code: "task1",
        description: [{ component: "heading", level: 2, text: "Test Task" }],
        name: "Test Task",
        type: "boolean",
        canCompleteTask: true,
      },
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with non-interactive form", () => {
    const component = render("task-details", {
      caseId: "case-id",
      phaseCode: "phase-1",
      stageCode: "strage-id",
      taskGroupCode: "task-group-code",
      taskCode: "task-id",
      isInteractive: false,
      currentTask: {
        code: "task1",
        description: [{ component: "heading", level: 2, text: "Test Task" }],
        name: "Test Task",
        type: "boolean",
        canCompleteTask: true,
      },
    });

    expect(component).toMatchSnapshot();
    expect(component).toContain("Tasks cannot be edited in the current status");
    expect(component).not.toContain("Save and continue");
  });

  test("renders with interactive form", () => {
    const component = render("task-details", {
      caseId: "case-id",
      phaseCode: "phase-1",
      stageCode: "strage-id",
      taskGroupCode: "task-group-code",
      taskCode: "task-id",
      isInteractive: true,
      currentTask: {
        code: "task1",
        description: [{ component: "heading", level: 2, text: "Test Task" }],
        name: "Test Task",
        type: "boolean",
        canCompleteTask: true,
      },
    });

    expect(component).toMatchSnapshot();
    expect(component).not.toContain(
      "Tasks cannot be edited in the current status",
    );
    expect(component).toContain("Save and continue");
  });

  test("renders completed task with editable form when case is interactive", () => {
    const component = render("task-details", {
      caseId: "case-id",
      phaseCode: "phase-1",
      stageCode: "strage-id",
      taskGroupCode: "task-group-code",
      taskCode: "task-id",
      isInteractive: true,
      currentTask: {
        code: "task1",
        description: [{ component: "heading", level: 2, text: "Test Task" }],
        name: "Test Task",
        type: "boolean",
        completed: true,
        canCompleteTask: true,
        updatedBy: "John Doe",
        updatedAt: "2024-01-15T10:30:00Z",
        status: "approved",
        statusOptions: [
          { code: "approved", name: "Approve" },
          { code: "rejected", name: "Reject" },
        ],
        comment: { text: "Initial review completed" },
      },
    });

    expect(component).toMatchSnapshot();
    expect(component).toContain("This task was completed by John Doe");
    expect(component).toContain("Save and continue");
  });

  test("renders completed task as read-only when case is not interactive", () => {
    const component = render("task-details", {
      caseId: "case-id",
      phaseCode: "phase-1",
      stageCode: "strage-id",
      taskGroupCode: "task-group-code",
      taskCode: "task-id",
      isInteractive: false,
      currentTask: {
        code: "task1",
        description: [{ component: "heading", level: 2, text: "Test Task" }],
        name: "Test Task",
        type: "boolean",
        completed: true,
        canCompleteTask: true,
        updatedBy: "John Doe",
        updatedAt: "2024-01-15T10:30:00Z",
        comment: { text: "Initial review completed" },
      },
    });

    expect(component).toMatchSnapshot();
    expect(component).toContain("This task was completed by John Doe");
    expect(component).toContain("Outcome review note");
    expect(component).toContain("Initial review completed");
    expect(component).not.toContain("Save and continue");
  });

  test("renders completed task without form when user lacks permission", () => {
    const component = render("task-details", {
      caseId: "case-id",
      phaseCode: "phase-1",
      stageCode: "strage-id",
      taskGroupCode: "task-group-code",
      taskCode: "task-id",
      isInteractive: true,
      currentTask: {
        code: "task1",
        description: [{ component: "heading", level: 2, text: "Test Task" }],
        name: "Test Task",
        type: "boolean",
        completed: true,
        canCompleteTask: false,
        updatedBy: "John Doe",
        updatedAt: "2024-01-15T10:30:00Z",
        requiredRoles: {
          allOf: ["admin"],
          anyOf: [],
        },
      },
    });

    expect(component).toMatchSnapshot();
    expect(component).toContain("This task was completed by John Doe");
    expect(component).toContain("You cannot edit this task");
    expect(component).toContain("Who can edit the task");
    expect(component).not.toContain("Save and continue");
  });
});

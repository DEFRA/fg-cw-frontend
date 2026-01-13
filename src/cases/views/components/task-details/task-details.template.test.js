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
      isInteractive: true,
      currentTask: {
        code: "task1",
        description: [{ component: "heading", level: 2, text: "Test Task" }],
        name: "Test Task",
        type: "boolean",
        canComplete: true,
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
        canComplete: true,
      },
    });

    expect(component).toMatchSnapshot();
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
        canComplete: true,
      },
    });

    expect(component).toMatchSnapshot();
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
        canComplete: true,
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
    expect(component).toContain("Confirm");
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
        canComplete: true,
        updatedBy: "John Doe",
        updatedAt: "2024-01-15T10:30:00Z",
        comment: { text: "Initial review completed" },
      },
    });

    expect(component).toMatchSnapshot();
    expect(component).toContain("This task was completed by John Doe");
    expect(component).toContain("Outcome review note");
    expect(component).toContain("Initial review completed");
    expect(component).not.toContain("Confirm");
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
        canComplete: false,
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
    expect(component).not.toContain("Confirm");
  });

  test("renders with notes history table when task has notesHistory", () => {
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
        canComplete: true,
        notesHistory: [
          {
            date: "2025-09-25T14:30:00.000Z",
            outcome: "Accepted",
            note: "Approved after review",
            addedBy: "A Jones",
          },
          {
            date: "2025-09-20T10:15:00.000Z",
            outcome: "Request information from customer",
            note: "Waiting for customer to provide updated bank details",
            addedBy: "B Smith",
          },
        ],
      },
    });

    expect(component).toMatchSnapshot();
    expect(component).toContain("Outcome history");
    expect(component).toContain("25 Sep 2025");
    expect(component).toContain("Accepted");
    expect(component).toContain("Approved after review");
    expect(component).toContain("A Jones");
  });

  test("does not render notes history table when notesHistory is empty", () => {
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
        canComplete: true,
        notesHistory: [],
      },
    });

    expect(component).not.toContain("Outcome history");
  });
});

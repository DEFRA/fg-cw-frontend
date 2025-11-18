import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("task-outcome-form", () => {
  test("renders with status options (radio buttons)", () => {
    const component = render("task-outcome-form", {
      formAction:
        "/cases/case-123/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: "approved",
      statusOptions: [
        { code: "approved", name: "Approve" },
        { code: "rejected", name: "Reject" },
        { code: "on-hold", name: "Put on hold" },
      ],
      completed: false,
      commentInputDef: null,
      commentText: "",
      error: null,
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders without status options (checkbox)", () => {
    const component = render("task-outcome-form", {
      formAction:
        "/cases/case-456/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: null,
      statusOptions: [],
      completed: true,
      commentInputDef: null,
      commentText: "",
      error: null,
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with required comment input", () => {
    const component = render("task-outcome-form", {
      formAction:
        "/cases/case-789/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: "approved",
      statusOptions: [
        { code: "approved", name: "Approve" },
        { code: "rejected", name: "Reject" },
      ],
      completed: false,
      commentInputDef: {
        label: "Approval reason",
        helpText: "Please provide a reason for your decision",
        mandatory: true,
      },
      commentText: "",
      error: null,
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with optional comment input", () => {
    const component = render("task-outcome-form", {
      formAction:
        "/cases/case-999/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: null,
      statusOptions: [],
      completed: false,
      commentInputDef: {
        label: "Additional notes",
        helpText: "Optional comments about this task",
        mandatory: false,
      },
      commentText: "Some existing notes",
      error: null,
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with comment input without help text", () => {
    const component = render("task-outcome-form", {
      formAction:
        "/cases/case-111/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: null,
      statusOptions: [],
      completed: false,
      commentInputDef: {
        label: "Notes",
        mandatory: true,
      },
      commentText: "",
      error: null,
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with error message", () => {
    const component = render("task-outcome-form", {
      formAction:
        "/cases/case-error/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: "approved",
      statusOptions: [{ code: "approved", name: "Approve" }],
      completed: false,
      commentInputDef: {
        label: "Approval reason",
        mandatory: true,
      },
      commentText: "",
      error: {
        text: "Comment is required",
        href: "#comment",
      },
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders checkbox with completed state", () => {
    const component = render("task-outcome-form", {
      formAction:
        "/cases/case-completed/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: null,
      statusOptions: null,
      completed: true,
      commentInputDef: {
        label: "Completion notes",
        mandatory: false,
      },
      commentText: "Task completed successfully",
      error: null,
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with pre-filled comment text", () => {
    const component = render("task-outcome-form", {
      formAction:
        "/cases/case-prefilled/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: "on-hold",
      statusOptions: [
        { code: "approved", name: "Approve" },
        { code: "rejected", name: "Reject" },
        { code: "on-hold", name: "Put on hold" },
      ],
      completed: false,
      commentInputDef: {
        label: "Reason for hold",
        helpText: "Explain why this is on hold",
        mandatory: true,
      },
      commentText: "Waiting for additional documentation from applicant",
      error: null,
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders minimal form (no options, no comment)", () => {
    const component = render("task-outcome-form", {
      formAction:
        "/cases/case-minimal/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: null,
      statusOptions: [],
      completed: false,
      commentInputDef: null,
      commentText: "",
      error: null,
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders interactive form when isInteractive is true", () => {
    const component = render("task-outcome-form", {
      formAction:
        "/cases/case-interactive/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: "approved",
      statusOptions: [
        { code: "approved", name: "Approve" },
        { code: "rejected", name: "Reject" },
      ],
      completed: false,
      commentInputDef: {
        label: "Comment",
        helpText: "Provide details",
        mandatory: true,
      },
      commentText: "",
      error: null,
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
    expect(component).toContain("Save and continue");
  });

  test("renders disabled form when isInteractive is false", () => {
    const component = render("task-outcome-form", {
      formAction:
        "/cases/case-disabled/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: "approved",
      statusOptions: [
        { code: "approved", name: "Approve" },
        { code: "rejected", name: "Reject" },
      ],
      completed: false,
      commentInputDef: {
        label: "Comment",
        helpText: "Provide details",
        mandatory: true,
      },
      commentText: "Some comment",
      error: null,
      isInteractive: false,
    });

    expect(component).toMatchSnapshot();
    expect(component).not.toContain("Save and continue");
    expect(component).toContain('aria-disabled="true"');
  });

  test("renders disabled form with radio buttons when isInteractive is false", () => {
    const component = render("task-outcome-form", {
      formAction:
        "/cases/case-disabled-radios/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: "on-hold",
      statusOptions: [
        { code: "approved", name: "Approve" },
        { code: "rejected", name: "Reject" },
        { code: "on-hold", name: "Put on hold" },
      ],
      completed: false,
      commentInputDef: null,
      commentText: "",
      error: null,
      isInteractive: false,
    });

    expect(component).toMatchSnapshot();
    expect(component).not.toContain("Save and continue");
    expect(component).toContain("disabled");
  });

  test("renders disabled form with checkbox when isInteractive is false", () => {
    const component = render("task-outcome-form", {
      formAction:
        "/cases/case-disabled-checkbox/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: null,
      statusOptions: [],
      completed: true,
      commentInputDef: {
        label: "Completion notes",
        mandatory: false,
      },
      commentText: "Completed",
      error: null,
      isInteractive: false,
    });

    expect(component).toMatchSnapshot();
    expect(component).not.toContain("Save and continue");
    expect(component).toContain("disabled");
  });
});

import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("task-outcome-form", () => {
  test("renders with status options (radio buttons)", () => {
    const component = render("task-outcome-form", {
      caseId: "case-123",
      formAction:
        "/cases/case-123/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: "approved",
      statusOptions: [
        { value: "approved", text: "Approve", checked: true },
        { value: "rejected", text: "Reject", checked: false },
        { value: "on-hold", text: "Put on hold", checked: false },
      ],
      completed: false,
      statusError: null,
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders without status options (checkbox)", () => {
    const component = render("task-outcome-form", {
      caseId: "case-456",
      formAction:
        "/cases/case-456/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: null,
      statusOptions: [],
      completed: true,
      statusError: null,
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with required comment input", () => {
    const component = render("task-outcome-form", {
      caseId: "case-789",
      formAction:
        "/cases/case-789/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: "approved",
      statusOptions: [
        {
          value: "approved",
          text: "Approve",
          checked: true,
          conditional: {
            id: "approved-comment",
            name: "approved-comment",
            value: "",
            label: { text: "Approval reason" },
            hint: { text: "Please provide a reason for your decision" },
            required: true,
            rows: 5,
          },
        },
        {
          value: "rejected",
          text: "Reject",
          checked: false,
          conditional: {
            id: "rejected-comment",
            name: "rejected-comment",
            value: "",
            label: { text: "Approval reason" },
            hint: { text: "Please provide a reason for your decision" },
            required: true,
            rows: 5,
          },
        },
      ],
      completed: false,
      statusError: null,
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with optional comment input", () => {
    const component = render("task-outcome-form", {
      caseId: "case-999",
      formAction:
        "/cases/case-999/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: null,
      statusOptions: [],
      completed: false,
      statusError: null,
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with comment input without help text", () => {
    const component = render("task-outcome-form", {
      caseId: "case-111",
      formAction:
        "/cases/case-111/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: null,
      statusOptions: [],
      completed: false,
      statusError: null,
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with error message", () => {
    const component = render("task-outcome-form", {
      caseId: "case-error",
      formAction:
        "/cases/case-error/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: "approved",
      statusOptions: [
        {
          value: "approved",
          text: "Approve",
          checked: true,
          conditional: {
            id: "approved-comment",
            name: "approved-comment",
            value: "",
            label: { text: "Approval reason" },
            required: true,
            errorMessage: {
              text: "Approval reason is required",
              href: "#approved-comment",
            },
            rows: 5,
          },
        },
      ],
      completed: false,
      statusError: null,
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders checkbox with completed state", () => {
    const component = render("task-outcome-form", {
      caseId: "case-completed",
      formAction:
        "/cases/case-completed/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: null,
      statusOptions: null,
      completed: true,
      statusError: null,
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with pre-filled comment text", () => {
    const component = render("task-outcome-form", {
      caseId: "case-prefilled",
      formAction:
        "/cases/case-prefilled/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: "on-hold",
      statusOptions: [
        {
          value: "approved",
          text: "Approve",
          checked: false,
          conditional: {
            id: "approved-comment",
            name: "approved-comment",
            value: "",
            label: { text: "Reason for hold" },
            hint: { text: "Explain why this is on hold" },
            required: true,
            rows: 5,
          },
        },
        {
          value: "rejected",
          text: "Reject",
          checked: false,
          conditional: {
            id: "rejected-comment",
            name: "rejected-comment",
            value: "",
            label: { text: "Reason for hold" },
            hint: { text: "Explain why this is on hold" },
            required: true,
            rows: 5,
          },
        },
        {
          value: "on-hold",
          text: "Put on hold",
          checked: true,
          conditional: {
            id: "on-hold-comment",
            name: "on-hold-comment",
            value: "Waiting for additional documentation from applicant",
            label: { text: "Reason for hold" },
            hint: { text: "Explain why this is on hold" },
            required: true,
            rows: 5,
          },
        },
      ],
      completed: false,
      statusError: null,
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders minimal form (no options, no comment)", () => {
    const component = render("task-outcome-form", {
      caseId: "case-minimal",
      formAction:
        "/cases/case-minimal/phases/phase-1/stages/stage-1/task-groups/tg-01/tasks/task-01/status",
      status: null,
      statusOptions: [],
      completed: false,
      statusError: null,
      isInteractive: true,
    });

    expect(component).toMatchSnapshot();
  });
});

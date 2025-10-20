import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("stage-actions", () => {
  test("renders basic stage actions", () => {
    const component = render("stage-actions", {
      caseId: "123",
      stage: {
        actions: {
          idPrefix: "actionCode",
          name: "actionCode",
          legend: "Decision",
          items: [
            {
              value: "approve",
              text: "Approve",
              checked: false,
            },
            {
              value: "reject",
              text: "Reject",
              checked: false,
            },
          ],
        },
        saveDisabled: false,
      },
    });

    expect(component).toMatchSnapshot();
  });

  test("renders stage actions with conditional textarea", () => {
    const component = render("stage-actions", {
      caseId: "456",
      stage: {
        actions: {
          idPrefix: "actionCode",
          name: "actionCode",
          legend: "Decision",
          errorMessage: null,
          items: [
            {
              value: "approve",
              text: "Approve",
              checked: true,
              conditional: {
                id: "approve-comment",
                name: "approve-comment",
                value: "This looks good",
                label: { text: "Approval reason" },
                hint: { text: "Please provide a reason" },
                rows: 3,
                required: true,
              },
            },
            {
              value: "reject",
              text: "Reject",
              checked: false,
            },
          ],
        },
        saveDisabled: false,
      },
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with error message", () => {
    const component = render("stage-actions", {
      caseId: "789",
      stage: {
        actions: {
          idPrefix: "actionCode",
          name: "actionCode",
          legend: "Decision",
          errorMessage: {
            text: "Please select an action",
            href: "#actionCode",
          },
          items: [
            {
              value: "approve",
              text: "Approve",
              checked: false,
            },
          ],
        },
        saveDisabled: false,
      },
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with save button disabled", () => {
    const component = render("stage-actions", {
      caseId: "999",
      stage: {
        actions: {
          idPrefix: "actionCode",
          name: "actionCode",
          legend: "Decision",
          items: [
            {
              value: "approve",
              text: "Approve",
              checked: false,
            },
          ],
        },
        saveDisabled: true,
      },
    });

    expect(component).toMatchSnapshot();
  });

  test("renders multiple actions with mixed conditionals", () => {
    const component = render("stage-actions", {
      caseId: "mixed-123",
      stage: {
        actions: {
          idPrefix: "actionCode",
          name: "actionCode",
          legend: "What do you want to do?",
          items: [
            {
              value: "approve",
              text: "Approve",
              checked: false,
              conditional: {
                id: "approve-comment",
                name: "approve-comment",
                value: "",
                label: { text: "Approval notes" },
                rows: 3,
                required: true,
              },
            },
            {
              value: "on-hold",
              text: "Put on hold",
              checked: true,
              conditional: {
                id: "on-hold-comment",
                name: "on-hold-comment",
                value: "Waiting for more information",
                label: { text: "Reason for hold" },
                hint: { text: "Optional notes" },
                rows: 2,
                required: false,
              },
            },
            {
              value: "reject",
              text: "Reject",
              checked: false,
            },
          ],
        },
        saveDisabled: false,
      },
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with textarea error", () => {
    const component = render("stage-actions", {
      caseId: "error-case",
      stage: {
        actions: {
          idPrefix: "actionCode",
          name: "actionCode",
          legend: "Decision",
          items: [
            {
              value: "approve",
              text: "Approve",
              checked: true,
              conditional: {
                id: "approve-comment",
                name: "approve-comment",
                value: "",
                label: { text: "Approval reason" },
                rows: 3,
                required: true,
                errorMessage: {
                  text: "Approval reason is required",
                  href: "#approve-comment",
                },
              },
            },
          ],
        },
        saveDisabled: false,
      },
    });

    expect(component).toMatchSnapshot();
  });
});

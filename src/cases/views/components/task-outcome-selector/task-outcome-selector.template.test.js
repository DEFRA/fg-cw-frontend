import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("task-outcome-selector", () => {
  test("renders radio buttons with single option", () => {
    const component = render("task-outcome-selector", {
      status: "approved",
      statusOptions: [{ value: "approved", text: "Approve", checked: true }],
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders radio buttons with multiple options", () => {
    const component = render("task-outcome-selector", {
      status: "rejected",
      statusOptions: [
        { value: "approved", text: "Approve", checked: false },
        { value: "rejected", text: "Reject", checked: true },
        { value: "on-hold", text: "Put on hold", checked: false },
        {
          value: "more-info",
          text: "Request more information",
          checked: false,
        },
      ],
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders radio buttons with first option selected", () => {
    const component = render("task-outcome-selector", {
      status: "approved",
      statusOptions: [
        { value: "approved", text: "Approve", checked: true },
        { value: "rejected", text: "Reject", checked: false },
      ],
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders radio buttons with no option selected", () => {
    const component = render("task-outcome-selector", {
      status: null,
      statusOptions: [
        { value: "approved", text: "Approve", checked: false },
        { value: "rejected", text: "Reject", checked: false },
        { value: "on-hold", text: "Put on hold", checked: false },
      ],
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders checkbox when no status options", () => {
    const component = render("task-outcome-selector", {
      status: null,
      statusOptions: [],
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders checkbox when statusOptions is null", () => {
    const component = render("task-outcome-selector", {
      status: null,
      statusOptions: null,
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders checkbox in checked state", () => {
    const component = render("task-outcome-selector", {
      status: null,
      statusOptions: [],
      completed: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders checkbox in unchecked state", () => {
    const component = render("task-outcome-selector", {
      status: null,
      statusOptions: null,
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders radio buttons with middle option selected", () => {
    const component = render("task-outcome-selector", {
      status: "on-hold",
      statusOptions: [
        { value: "approved", text: "Approve", checked: false },
        { value: "on-hold", text: "Put on hold", checked: true },
        { value: "rejected", text: "Reject", checked: false },
      ],
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with empty statusOptions array", () => {
    const component = render("task-outcome-selector", {
      status: "approved",
      statusOptions: [],
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders radio buttons with long option names", () => {
    const component = render("task-outcome-selector", {
      status: "approved-with-conditions",
      statusOptions: [
        {
          value: "approved-with-conditions",
          text: "Approve with conditions that need to be met before final approval",
          checked: true,
        },
        {
          value: "rejected-insufficient-info",
          text: "Reject due to insufficient information provided in the application",
          checked: false,
        },
      ],
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });
});

import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("task-outcome-selector", () => {
  test("renders radio buttons with single option", () => {
    const component = render("task-outcome-selector", {
      status: "approved",
      statusOptions: [{ code: "approved", name: "Approve" }],
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders radio buttons with multiple options", () => {
    const component = render("task-outcome-selector", {
      status: "rejected",
      statusOptions: [
        { code: "approved", name: "Approve" },
        { code: "rejected", name: "Reject" },
        { code: "on-hold", name: "Put on hold" },
        { code: "more-info", name: "Request more information" },
      ],
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders radio buttons with first option selected", () => {
    const component = render("task-outcome-selector", {
      status: "approved",
      statusOptions: [
        { code: "approved", name: "Approve" },
        { code: "rejected", name: "Reject" },
      ],
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders radio buttons with no option selected", () => {
    const component = render("task-outcome-selector", {
      status: null,
      statusOptions: [
        { code: "approved", name: "Approve" },
        { code: "rejected", name: "Reject" },
        { code: "on-hold", name: "Put on hold" },
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
        { code: "approved", name: "Approve" },
        { code: "on-hold", name: "Put on hold" },
        { code: "rejected", name: "Reject" },
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
          code: "approved-with-conditions",
          name: "Approve with conditions that need to be met before final approval",
        },
        {
          code: "rejected-insufficient-info",
          name: "Reject due to insufficient information provided in the application",
        },
      ],
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });
});

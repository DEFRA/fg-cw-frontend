import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("task-outcome-selector", () => {
  test("renders radio buttons with single option", () => {
    const component = render("task-outcome-selector", {
      value: "approved",
      valueOptions: [{ value: "approved", text: "Approve", checked: true }],
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders radio buttons with multiple options", () => {
    const component = render("task-outcome-selector", {
      value: "rejected",
      valueOptions: [
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
      value: "approved",
      valueOptions: [
        { value: "approved", text: "Approve", checked: true },
        { value: "rejected", text: "Reject", checked: false },
      ],
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders radio buttons with no option selected", () => {
    const component = render("task-outcome-selector", {
      value: null,
      valueOptions: [
        { value: "approved", text: "Approve", checked: false },
        { value: "rejected", text: "Reject", checked: false },
        { value: "on-hold", text: "Put on hold", checked: false },
      ],
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders checkbox when no value options", () => {
    const component = render("task-outcome-selector", {
      value: null,
      valueOptions: [],
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders checkbox when valueOptions is null", () => {
    const component = render("task-outcome-selector", {
      value: null,
      valueOptions: null,
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders checkbox in checked state", () => {
    const component = render("task-outcome-selector", {
      value: null,
      valueOptions: [],
      completed: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders checkbox in unchecked state", () => {
    const component = render("task-outcome-selector", {
      value: null,
      valueOptions: null,
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders radio buttons with middle option selected", () => {
    const component = render("task-outcome-selector", {
      value: "on-hold",
      valueOptions: [
        { value: "approved", text: "Approve", checked: false },
        { value: "on-hold", text: "Put on hold", checked: true },
        { value: "rejected", text: "Reject", checked: false },
      ],
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with empty valueOptions array", () => {
    const component = render("task-outcome-selector", {
      value: "approved",
      valueOptions: [],
      completed: false,
    });

    expect(component).toMatchSnapshot();
  });

  describe("input tasks", () => {
    const textInput = {
      id: "value",
      name: "value",
      type: "text",
      value: "",
      label: { text: "Siti/FC reference" },
      hint: { text: "For example, SF123456" },
      attributes: { maxlength: 20 },
    };

    test("renders a text input with hint and maxlength", () => {
      const component = render("task-outcome-selector", {
        input: { ...textInput, pattern: "[A-Z]{2}[0-9]{6}" },
        valueOptions: [],
      });

      expect(component).toMatchSnapshot();
    });

    test("renders a number input as text with a numeric inputmode", () => {
      const component = render("task-outcome-selector", {
        input: {
          id: "value",
          name: "value",
          type: "text",
          inputmode: "numeric",
          value: "1200",
          label: { text: "Herd size" },
          attributes: { min: 1, max: 5000 },
        },
        valueOptions: [],
      });

      expect(component).toMatchSnapshot();
    });

    test("renders a date input", () => {
      const component = render("task-outcome-selector", {
        input: {
          id: "value",
          name: "value",
          type: "date",
          value: "2026-03-27",
          label: { text: "Date of last inspection" },
          attributes: {},
        },
        valueOptions: [],
      });

      expect(component).toMatchSnapshot();
    });

    test("renders a saved value back into the field", () => {
      const component = render("task-outcome-selector", {
        input: { ...textInput, value: "SF123456" },
        valueOptions: [],
      });

      expect(component).toContain('value="SF123456"');
      expect(component).toMatchSnapshot();
    });

    test("renders an error message against the field", () => {
      const component = render("task-outcome-selector", {
        input: textInput,
        valueOptions: [],
        errorMessage: { text: "Enter a value" },
      });

      expect(component).toMatchSnapshot();
    });

    test("renders a disabled field without write access", () => {
      const component = render("task-outcome-selector", {
        input: textInput,
        valueOptions: [],
        disabled: true,
      });

      expect(component).toMatchSnapshot();
    });

    test("renders neither radios nor the completed checkbox", () => {
      const component = render("task-outcome-selector", {
        input: textInput,
        // A task always has one or the other, but assert the input branch wins
        // even if both somehow arrive.
        valueOptions: [{ value: "approved", text: "Approve", checked: false }],
        completed: true,
      });

      expect(component).not.toContain("govuk-radios");
      expect(component).not.toContain("govuk-checkboxes");
      expect(component).not.toContain('name="completed"');
    });
  });

  test("renders radio buttons with long option names", () => {
    const component = render("task-outcome-selector", {
      value: "approved-with-conditions",
      valueOptions: [
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

import { describe, expect, test } from "vitest";
import { render } from "../../nunjucks/render.js";

describe("notification-banner", () => {
  test("renders with heading and simple text", () => {
    const component = render("notification-banner", {
      heading: "Success",
      text: "Operation completed successfully",
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with heading and complex HTML", () => {
    const component = render("notification-banner", {
      heading: "Success",
      html: '<a class="govuk-notification-banner__link" href="/cases/123">Case ID 123</a> has been assigned to John Doe',
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with text only (no heading)", () => {
    const component = render("notification-banner", {
      text: "Simple notification message",
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with HTML only (no heading)", () => {
    const component = render("notification-banner", {
      html: '<a href="/link">Click here</a> for more information',
    });

    expect(component).toMatchSnapshot();
  });

  test("HTML takes precedence over text when both provided", () => {
    const component = render("notification-banner", {
      heading: "Test",
      text: "This should be ignored",
      html: "<strong>This HTML should be used</strong>",
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with different banner type", () => {
    const component = render("notification-banner", {
      heading: "Warning",
      text: "This is a warning message",
      type: "warning",
    });

    expect(component).toMatchSnapshot();
  });

  test("does not render when no content provided", () => {
    const component = render("notification-banner", {
      heading: "Empty",
    });

    expect(component.trim()).toBe("");
  });

  test("does not render when params is undefined", () => {
    const component = render("notification-banner", undefined);

    expect(component.trim()).toBe("");
  });
});

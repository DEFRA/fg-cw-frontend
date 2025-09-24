import { describe, expect, test } from "vitest";
import { render } from "../../nunjucks/render.js";

describe("copy-to-clipboard template", () => {
  test("renders with default parameters", () => {
    const component = render("copy-to-clipboard", {});
    expect(component).toMatchSnapshot();
  });

  test("renders with custom text to copy", () => {
    const component = render("copy-to-clipboard", {
      text: "user@example.com",
    });
    expect(component).toMatchSnapshot();
  });

  test("renders with custom button text", () => {
    const component = render("copy-to-clipboard", {
      text: "secret-key-123",
      buttonText: "Copy Key",
    });
    expect(component).toMatchSnapshot();
  });

  test("renders with custom feedback text", () => {
    const component = render("copy-to-clipboard", {
      text: "some-value",
      feedbackText: "Value copied!",
    });
    expect(component).toMatchSnapshot();
  });

  test("renders with custom CSS classes", () => {
    const component = render("copy-to-clipboard", {
      text: "test-value",
      classes: "custom-class another-class",
    });
    expect(component).toMatchSnapshot();
  });

  test("renders with all custom parameters", () => {
    const component = render("copy-to-clipboard", {
      text: "full-example@test.com",
      buttonText: "Copy Email",
      feedbackText: "Email copied successfully!",
      classes: "govuk-button govuk-button--secondary",
    });
    expect(component).toMatchSnapshot();
  });
});

import { describe, expect, test } from "vitest";
import { render } from "../../nunjucks/render.js";

describe("expandable-text template", () => {
  test("renders truncated text with toggle when text is long", () => {
    const longText =
      "This is a very long piece of text that should definitely be truncated because it exceeds the default truncate length of 100 characters and should show a toggle button.";

    const component = render("expandable-text", {
      text: longText,
      href: "/some-link",
      ref: "test-ref-123",
      isSelected: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders full text without toggle when text is short", () => {
    const shortText = "This is short text.";

    const component = render("expandable-text", {
      text: shortText,
      href: "/some-link",
      ref: "test-ref-456",
      isSelected: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders full text when isSelected is true regardless of length", () => {
    const longText =
      "This is a very long piece of text that should definitely be truncated because it exceeds the default truncate length of 100 characters but won't because isSelected is true.";

    const component = render("expandable-text", {
      text: longText,
      href: "/some-link",
      ref: "test-ref-789",
      isSelected: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with custom linkText and truncateLength", () => {
    const longText =
      "This text will be truncated at 50 characters because we set a custom truncate length parameter.";

    const component = render("expandable-text", {
      text: longText,
      href: "/custom-link",
      ref: "test-ref-custom",
      isSelected: false,
      linkText: "show more details",
      truncateLength: 50,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders without toggle when href is missing", () => {
    const longText =
      "This is a very long piece of text that should be truncated but won't have a toggle button because href is missing from the parameters.";

    const component = render("expandable-text", {
      text: longText,
      ref: "test-ref-no-href",
      isSelected: false,
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with correct data attributes", () => {
    const longText =
      "This text tests that the correct data attributes are set on the container div element.";

    const component = render("expandable-text", {
      text: longText,
      href: "/data-test",
      ref: "test-ref-data",
      isSelected: false,
      linkText: "read more",
      truncateLength: 75,
    });

    expect(component).toMatchSnapshot();
  });
});

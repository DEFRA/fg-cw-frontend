import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("dynamic-content template", () => {
  test("renders no content message when params is undefined", () => {
    const result = render("dynamic-content", undefined);

    expect(result.trim()).toBe(
      '<p class="govuk-body">No content available.</p>',
    );
  });

  test("renders no content message when params is null", () => {
    const result = render("dynamic-content", null);

    expect(result.trim()).toBe(
      '<p class="govuk-body">No content available.</p>',
    );
  });

  test("renders no content message when params is empty array", () => {
    const result = render("dynamic-content", []);

    expect(result.trim()).toBe(
      '<p class="govuk-body">No content available.</p>',
    );
  });

  test("renders single text component", () => {
    const params = [
      {
        component: "text",
        text: "Hello world",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Hello world");
  });

  test("renders multiple components", () => {
    const params = [
      {
        component: "heading",
        text: "Test Heading",
        level: 2,
      },
      {
        component: "text",
        text: "Some text content",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Test Heading");
    expect(result).toContain("Some text content");
  });

  test("renders status component", () => {
    const params = [
      {
        component: "status",
        status: "active",
        text: "Active",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Active");
  });

  test("renders url component", () => {
    const params = [
      {
        component: "url",
        href: "https://example.com",
        text: "Example Link",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("https://example.com");
    expect(result).toContain("Example Link");
  });

  test("renders list component", () => {
    const params = [
      {
        component: "list",
        rows: [
          { component: "text", text: "Item 1" },
          { component: "text", text: "Item 2" },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Item 1");
    expect(result).toContain("Item 2");
  });

  test("renders table component", () => {
    const params = [
      {
        component: "table",
        rows: [
          [
            { label: "Name", component: "text", text: "Row 1 Col 1" },
            { label: "Value", component: "text", text: "Row 1 Col 2" },
          ],
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Name");
    expect(result).toContain("Value");
    expect(result).toContain("Row 1 Col 1");
    expect(result).toContain("Row 1 Col 2");
  });

  test("renders container component with nested content", () => {
    const params = [
      {
        component: "container",
        items: [
          {
            component: "heading",
            text: "Container Heading",
            level: 3,
          },
          {
            component: "text",
            text: "Container content",
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Container Heading");
    expect(result).toContain("Container content");
  });

  test("renders copyToClipboard component", () => {
    const params = [
      {
        component: "copyToClipboard",
        text: "Copy this text",
        value: "Clipboard value",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Copy this text");
  });

  test("defaults to text component when component type not specified", () => {
    const params = [
      {
        text: "Default text component",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Default text component");
  });

  test("handles mixed component types in sequence", () => {
    const params = [
      {
        component: "heading",
        text: "Main Heading",
        level: 1,
      },
      {
        component: "text",
        text: "Introduction paragraph",
      },
      {
        component: "status",
        status: "complete",
        text: "Completed",
      },
      {
        component: "url",
        href: "/next-step",
        text: "Continue",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Main Heading");
    expect(result).toContain("Introduction paragraph");
    expect(result).toContain("Completed");
    expect(result).toContain("Continue");
    expect(result).toContain("/next-step");
  });
});

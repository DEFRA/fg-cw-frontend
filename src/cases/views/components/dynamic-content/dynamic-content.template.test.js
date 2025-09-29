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

  test("renders status component with labelsMap", () => {
    const params = [
      {
        component: "status",
        text: "PENDING_REVIEW",
        labelsMap: {
          PENDING_REVIEW: "Under Review",
          APPROVED: "Approved",
        },
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Under Review");
    expect(result).toContain("govuk-tag--grey");
  });

  test("renders status component with both classesMap and labelsMap", () => {
    const params = [
      {
        component: "status",
        text: "URGENT",
        classesMap: {
          URGENT: "govuk-tag--red",
        },
        labelsMap: {
          URGENT: "Urgent Action Required",
        },
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Urgent Action Required");
    expect(result).toContain("govuk-tag--red");
  });

  test("renders status component with colour parameter", () => {
    const params = [
      {
        component: "status",
        text: "urgent",
        colour: "red",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Urgent");
    expect(result).toContain("govuk-tag--red");
  });

  test("renders status component with classesMap overriding colour", () => {
    const params = [
      {
        component: "status",
        text: "critical",
        colour: "blue",
        classesMap: {
          critical: "govuk-tag--red",
        },
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Critical");
    expect(result).toContain("govuk-tag--red");
    expect(result).not.toContain("govuk-tag--blue");
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

  test("renders summary-list component", () => {
    const params = [
      {
        component: "summary-list",
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

  test("renders details component with component arrays", () => {
    const params = [
      {
        component: "details",
        summaryItems: [{ component: "text", text: "Help with nationality" }],
        items: [
          {
            component: "text",
            text: "We need to know your nationality so we can work out which elections you're entitled to vote in.",
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Help with nationality");
    expect(result).toContain("We need to know your nationality");
    expect(result).toContain("govuk-details");
    expect(result).toContain("govuk-details__summary");
    expect(result).toContain("govuk-details__text");
  });

  test("renders details component with nested components", () => {
    const params = [
      {
        component: "details",
        summaryItems: [{ component: "text", text: "More information" }],
        items: [
          {
            component: "heading",
            text: "Additional details",
            level: 4,
          },
          {
            component: "text",
            text: "Here is some detailed information.",
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("More information");
    expect(result).toContain("Additional details");
    expect(result).toContain("Here is some detailed information");
    expect(result).toContain("govuk-details");
  });

  test("renders details component with open attribute", () => {
    const params = [
      {
        component: "details",
        summaryItems: [{ component: "text", text: "Already open" }],
        items: [
          { component: "text", text: "This content is visible by default" },
        ],
        open: true,
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("open");
    expect(result).toContain("Already open");
  });

  test("renders details component with summaryItems components", () => {
    const params = [
      {
        component: "details",
        summaryItems: [
          {
            component: "text",
            text: "Help with ",
          },
          {
            component: "status",
            status: "required",
            text: "Nationality",
          },
        ],
        items: [
          {
            component: "text",
            text: "We need your nationality information.",
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Help with");
    expect(result).toContain("Nationality");
    expect(result).toContain("We need your nationality information");
    expect(result).toContain("govuk-details__summary-text");
  });

  test("renders paragraph component with default govuk-body styling", () => {
    const params = [
      {
        component: "paragraph",
        text: "This is a paragraph with proper semantic markup.",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain(
      "This is a paragraph with proper semantic markup.",
    );
    expect(result).toContain('<p class="govuk-body">');
    expect(result).toContain("</p>");
  });

  test("renders paragraph component with custom classes", () => {
    const params = [
      {
        component: "paragraph",
        text: "Important information",
        classes: "govuk-body govuk-!-font-weight-bold",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Important information");
    expect(result).toContain('class="govuk-body govuk-!-font-weight-bold"');
  });

  test("renders paragraph component with id", () => {
    const params = [
      {
        component: "paragraph",
        text: "Referenced content",
        id: "important-section",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Referenced content");
    expect(result).toContain('id="important-section"');
  });

  test("renders unordered-list component with simple text items", () => {
    const params = [
      {
        component: "unordered-list",
        items: [{ text: "apples" }, { text: "oranges" }, { text: "pears" }],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("apples");
    expect(result).toContain("oranges");
    expect(result).toContain("pears");
    expect(result).toContain('<ul class="govuk-list govuk-list--bullet">');
    expect(result).toContain("</ul>");
  });

  test("renders unordered-list component with nested components", () => {
    const params = [
      {
        component: "unordered-list",
        items: [
          { component: "text", text: "apples" },
          { component: "url", href: "/oranges", text: "oranges" },
          { component: "text", text: "pears" },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("apples");
    expect(result).toContain("oranges");
    expect(result).toContain("/oranges");
    expect(result).toContain("pears");
    expect(result).toContain("govuk-list--bullet");
  });

  test("renders ordered-list component with simple text items", () => {
    const params = [
      {
        component: "ordered-list",
        items: [
          {
            text: "Applicant has applied for more than the total available area in the land parcel for this action.",
          },
          {
            text: "The land details and calculation have changed after the application was submitted.",
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Applicant has applied for more than");
    expect(result).toContain("The land details and calculation have changed");
    expect(result).toContain('<ol class="govuk-list govuk-list--number">');
    expect(result).toContain("</ol>");
  });

  test("renders ordered-list component with spaced classes", () => {
    const params = [
      {
        component: "ordered-list",
        classes: "govuk-list govuk-list--number govuk-list--spaced",
        items: [
          {
            text: "First very long item that spans multiple lines and needs extra spacing for better readability",
          },
          {
            text: "Second very long item that also spans multiple lines and needs extra spacing",
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("govuk-list--number govuk-list--spaced");
    expect(result).toContain("First very long item");
    expect(result).toContain("Second very long item");
  });

  test("renders unordered-list with custom classes", () => {
    const params = [
      {
        component: "unordered-list",
        classes: "custom-list-class",
        items: [{ text: "Item 1" }, { text: "Item 2" }],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain('class="custom-list-class"');
    expect(result).toContain("Item 1");
    expect(result).toContain("Item 2");
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

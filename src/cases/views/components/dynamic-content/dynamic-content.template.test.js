import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("dynamic-content template", () => {
  test("renders no content message when params is undefined", () => {
    const result = render("dynamic-content", undefined);

    expect(result.trim()).toBe("");
  });

  test("renders no content message when params is null", () => {
    const result = render("dynamic-content", null);

    expect(result.trim()).toBe("");
  });

  test("renders no content message when params is empty array", () => {
    const result = render("dynamic-content", []);

    expect(result.trim()).toBe("");
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

  test("renders status component with NONE theme", () => {
    const params = [
      {
        component: "status",
        text: "Plain Text",
        theme: "NONE",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Plain text");
    expect(result).not.toContain("govuk-tag");
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

  test("renders url component with default target _self and no rel", () => {
    const params = [
      {
        component: "url",
        href: "https://example.com",
        text: "Example Link",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain('target="_self"');
    expect(result).not.toContain('rel="');
  });

  test("renders url component with _blank target and automatic rel", () => {
    const params = [
      {
        component: "url",
        href: "https://example.com",
        text: "Example Link",
        target: "_blank",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  test("renders url component with explicit rel override", () => {
    const params = [
      {
        component: "url",
        href: "https://example.com",
        text: "Example Link",
        target: "_blank",
        rel: "noreferrer",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noreferrer"');
  });

  test("renders summary-list component with simple string label and text", () => {
    const params = [
      {
        component: "summary-list",
        rows: [
          {
            label: "Name",
            text: "John Smith",
          },
          {
            label: "Date of birth",
            text: "5 January 1978",
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("govuk-summary-list");
    expect(result).toContain("Name");
    expect(result).toContain("John Smith");
    expect(result).toContain("Date of birth");
    expect(result).toContain("5 January 1978");
  });

  test("renders summary-list component with component array label and text", () => {
    const params = [
      {
        component: "summary-list",
        rows: [
          {
            label: [{ component: "text", text: "Parcel ID" }],
            text: [{ component: "text", text: "SO3757 3059" }],
          },
          {
            label: [
              { component: "text", text: "Status " },
              { component: "status", text: "URGENT", colour: "red" },
            ],
            text: [
              { component: "text", text: "100 ha " },
              { component: "status", text: "PASSED", colour: "green" },
            ],
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Parcel ID");
    expect(result).toContain("SO3757 3059");
    expect(result).toContain("Status");
    expect(result).toContain("Urgent");
    expect(result).toContain("govuk-tag--red");
    expect(result).toContain("100 ha");
    expect(result).toContain("Passed");
    expect(result).toContain("govuk-tag--green");
  });

  test("renders summary-list component with mixed string and array formats", () => {
    const params = [
      {
        component: "summary-list",
        rows: [
          {
            label: "Simple label",
            text: "Simple text",
          },
          {
            label: [{ component: "text", text: "Complex label" }],
            text: "Simple text",
          },
          {
            label: "Simple label",
            text: [
              { component: "text", text: "Complex " },
              { component: "status", text: "text", colour: "blue" },
            ],
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Simple label");
    expect(result).toContain("Simple text");
    expect(result).toContain("Complex label");
    expect(result).toContain("Complex");
    expect(result).toContain("Text");
    expect(result).toContain("govuk-tag--blue");
  });

  test("renders summary-list component with title", () => {
    const params = [
      {
        component: "summary-list",
        title: "Check details",
        rows: [
          {
            label: "Name",
            text: "Sarah Philips",
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Check details");
    expect(result).toContain("Name");
    expect(result).toContain("Sarah Philips");
  });

  test("renders summary-list component with rich text content", () => {
    const params = [
      {
        component: "summary-list",
        rows: [
          {
            label: "Payment status",
            text: [
              { component: "status", text: "OVERDUE", colour: "red" },
              { component: "text", text: " - " },
              { component: "url", href: "/pay-now", text: "Pay now" },
            ],
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Payment status");
    expect(result).toContain("Overdue");
    expect(result).toContain("govuk-tag--red");
    expect(result).toContain("Pay now");
    expect(result).toContain("/pay-now");
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

  test("renders table component with caption", () => {
    const params = [
      {
        component: "table",
        caption: "Assessment Results",
        captionClasses: "govuk-table__caption--l",
        rows: [
          [
            { label: "Name", component: "text", text: "Test Data" },
            { label: "Score", component: "text", text: "95%" },
          ],
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Assessment Results");
    expect(result).toContain("govuk-table__caption--l");
    expect(result).toContain("<caption");
    expect(result).toContain("Test Data");
    expect(result).toContain("95%");
  });

  test("renders table component with title for backward compatibility", () => {
    const params = [
      {
        component: "table",
        title: "Legacy Title",
        rows: [
          [
            { label: "Name", component: "text", text: "Test Data" },
            { label: "Score", component: "text", text: "85%" },
          ],
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Legacy Title");
    expect(result).toContain("govuk-heading-m");
    expect(result).toContain("Test Data");
    expect(result).toContain("85%");
  });

  test("renders table component with caption overriding title", () => {
    const params = [
      {
        component: "table",
        caption: "New Caption",
        captionClasses: "govuk-table__caption--m",
        title: "Old Title",
        rows: [
          [
            { label: "Name", component: "text", text: "Test Data" },
            { label: "Score", component: "text", text: "92%" },
          ],
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("New Caption");
    expect(result).toContain("<caption");
    expect(result).not.toContain("Old Title");
    expect(result).toContain("Test Data");
    expect(result).toContain("92%");
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
            text: "We need to know your nationality",
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

  test("renders paragraph component with default styling", () => {
    const params = [
      {
        component: "paragraph",
        text: "This is a paragraph.",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("This is a paragraph.");
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

  test("renders accordion component with simple items", () => {
    const params = [
      {
        component: "accordion",
        id: "static-accordion",
        items: [
          {
            heading: [{ component: "text", text: "Section 1" }],
            content: [
              {
                component: "text",
                text: "Content here",
              },
            ],
          },
          {
            heading: [{ component: "text", text: "Section 2" }],
            content: [
              {
                component: "paragraph",
                text: "Paragraph content in section 2",
              },
            ],
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("govuk-accordion");
    expect(result).toContain('id="static-accordion"');
    expect(result).toContain("Section 1");
    expect(result).toContain("Section 2");
    expect(result).toContain("Content here");
    expect(result).toContain("Paragraph content in section 2");
  });

  test("renders accordion component with nested components in content", () => {
    const params = [
      {
        component: "accordion",
        id: "complex-accordion",
        items: [
          {
            heading: [{ component: "text", text: "Details" }],
            content: [
              {
                component: "heading",
                text: "Sub-heading",
                level: 3,
              },
              {
                component: "unordered-list",
                items: [{ text: "Item 1" }, { text: "Item 2" }],
              },
            ],
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("govuk-accordion");
    expect(result).toContain("Details");
    expect(result).toContain("Sub-heading");
    expect(result).toContain("Item 1");
    expect(result).toContain("Item 2");
  });

  test("renders accordion component with summary components", () => {
    const params = [
      {
        component: "accordion",
        id: "accordion-with-summary",
        items: [
          {
            heading: [{ component: "text", text: "More info" }],
            summary: [{ component: "text", text: "Additional context" }],
            content: [
              {
                component: "text",
                text: "Detailed information",
              },
            ],
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("govuk-accordion__section-summary");
    expect(result).toContain("Additional context");
    expect(result).toContain("More info");
    expect(result).toContain("Detailed information");
  });

  test("renders accordion component with expanded section", () => {
    const params = [
      {
        component: "accordion",
        id: "expanded-accordion",
        items: [
          {
            heading: [{ component: "text", text: "Expanded Section" }],
            expanded: true,
            content: [
              {
                component: "text",
                text: "This section is open by default",
              },
            ],
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    // Check for the expanded class marker (JS will add aria-expanded at runtime)
    expect(result).toContain("govuk-accordion__section--expanded");
    expect(result).toContain("Expanded Section");
    expect(result).toContain("This section is open by default");
    // Verify it uses span, not button (JS will convert to button)
    expect(result).toContain('<span class="govuk-accordion__section-button"');
  });

  test("renders accordion with rich heading and summary components", () => {
    const params = [
      {
        component: "accordion",
        id: "rich-accordion",
        items: [
          {
            heading: [
              { component: "text", text: "Payment details " },
              { component: "status", text: "OVERDUE", colour: "red" },
            ],
            summary: [
              { component: "text", text: "Action required - " },
              { component: "url", href: "/pay-now", text: "Pay now" },
            ],
            content: [
              { component: "paragraph", text: "Your payment is overdue." },
            ],
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Payment details");
    expect(result).toContain("Overdue");
    expect(result).toContain("govuk-tag--red");
    expect(result).toContain("Action required -");
    expect(result).toContain("Pay now");
    expect(result).toContain("/pay-now");
  });

  test("renders accordion component with rememberExpanded set to false", () => {
    const params = [
      {
        component: "accordion",
        id: "no-remember-accordion",
        rememberExpanded: false,
        items: [
          {
            heading: [{ component: "text", text: "Section 1" }],
            content: [{ component: "text", text: "Content 1" }],
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("govuk-accordion");
    expect(result).toContain('data-remember-expanded="false"');
    expect(result).toContain("Section 1");
  });

  test("renders accordion component with rememberExpanded set to true", () => {
    const params = [
      {
        component: "accordion",
        id: "remember-accordion",
        rememberExpanded: true,
        items: [
          {
            heading: [{ component: "text", text: "Section 1" }],
            content: [{ component: "text", text: "Content 1" }],
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("govuk-accordion");
    expect(result).toContain('data-remember-expanded="true"');
    expect(result).toContain("Section 1");
  });

  test("renders accordion component without rememberExpanded defaults to undefined", () => {
    const params = [
      {
        component: "accordion",
        id: "default-accordion",
        items: [
          {
            heading: [{ component: "text", text: "Section 1" }],
            content: [{ component: "text", text: "Content 1" }],
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("govuk-accordion");
    expect(result).not.toContain("data-remember-expanded");
    expect(result).toContain("Section 1");
  });

  test("renders line-break component", () => {
    const params = [
      {
        component: "line-break",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("<br />");
  });

  test("renders line-break component within container for layout control", () => {
    const params = [
      {
        component: "container",
        items: [
          {
            component: "status",
            text: "COMPLETE",
            colour: "green",
          },
          {
            component: "text",
            text: " - Task finished successfully",
          },
          {
            component: "line-break",
          },
          {
            component: "url",
            href: "/next",
            text: "Continue to next step",
          },
        ],
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("Complete");
    expect(result).toContain("Task finished successfully");
    expect(result).toContain("<br />");
    expect(result).toContain("Continue to next step");
    expect(result).toContain("/next");
  });

  test("renders warning-text component with default settings", () => {
    const params = [
      {
        component: "warning-text",
        text: "You can be fined up to £5,000 if you do not register.",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("govuk-warning-text");
    expect(result).toContain(
      "You can be fined up to £5,000 if you do not register.",
    );
    expect(result).toContain(
      'class="govuk-warning-text__icon" aria-hidden="true">!</span>',
    );
    expect(result).toContain(
      '<span class="govuk-visually-hidden">Warning</span>',
    );
  });

  test("renders warning-text component with custom icon fallback text", () => {
    const params = [
      {
        component: "warning-text",
        text: "This action cannot be undone.",
        iconFallbackText: "Caution",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("govuk-warning-text");
    expect(result).toContain("This action cannot be undone.");
    expect(result).toContain(
      '<span class="govuk-visually-hidden">Caution</span>',
    );
  });

  test("renders warning-text component with custom classes and attributes", () => {
    const params = [
      {
        component: "warning-text",
        text: "Legal warning message",
        classes: "legal-warning",
        attributes: { "data-testid": "legal-warning" },
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain('class="govuk-warning-text legal-warning"');
    expect(result).toContain('data-testid="legal-warning"');
    expect(result).toContain("Legal warning message");
  });

  test("renders alert component with default variant", () => {
    const params = [
      {
        component: "alert",
        title: "Information alert",
        text: "This is an information alert.",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("moj-alert");
    expect(result).toContain("moj-alert--information");
    expect(result).toContain("This is an information alert.");
  });

  test("renders alert component with success variant", () => {
    const params = [
      {
        component: "alert",
        variant: "success",
        title: "Success alert",
        text: "File uploaded successfully.",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("moj-alert");
    expect(result).toContain("moj-alert--success");
    expect(result).toContain("File uploaded successfully.");
  });

  test("renders alert component with dismissible option", () => {
    const params = [
      {
        component: "alert",
        variant: "warning",
        title: "Warning alert",
        text: "This is a warning.",
        dismissible: true,
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("moj-alert");
    expect(result).toContain("moj-alert--warning");
    expect(result).toContain("This is a warning.");
    expect(result).toContain('data-module="moj-alert"');
  });

  test("escapes HTML in text component", () => {
    const params = [
      {
        component: "text",
        text: "This contains <script>alert('xss')</script> HTML",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain(
      "&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;",
    );
    expect(result).not.toContain("<script>");
  });

  test("escapes HTML in paragraph component", () => {
    const params = [
      {
        component: "paragraph",
        text: "Paragraph with <strong>bold</strong> text",
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("&lt;strong&gt;bold&lt;/strong&gt;");
    expect(result).not.toContain("<strong>");
  });

  test("escapes HTML in heading component", () => {
    const params = [
      {
        component: "heading",
        text: "Heading with <em>emphasis</em>",
        level: 2,
      },
    ];

    const result = render("dynamic-content", params);

    expect(result).toContain("&lt;em&gt;emphasis&lt;/em&gt;");
    expect(result).not.toContain("<em>");
  });
});

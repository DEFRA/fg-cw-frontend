# Dynamic Content Components

## Overview

Components to be sent as structured JSON data that gets rendered into GOV.UK-compliant HTML components. Each component follows a consistent pattern with a `component` field specifying the type.

## Component Reference

### 1. Text Component

**Purpose**: Inline text content

```
{
  "component": "text",
  "text": "Some inline text",
  "classes": "govuk-!-font-weight-bold"
}
```

**Parameters**:

- `text` (required): The text content
- `classes` (optional): Additional CSS classes

**Output**: `<span class="classes">text</span>`

---

### 2. Paragraph Component

**Purpose**: Block-level paragraph content

```
{
  "component": "paragraph",
  "text": "This is a paragraph with proper semantic markup.",
  "classes": "govuk-body govuk-!-font-weight-bold",
  "id": "important-section"
}
```

**Parameters**:

- `text` (required): The paragraph content
- `classes` (optional): CSS classes (defaults to `govuk-body`)
- `id` (optional): HTML ID attribute

**Output**: `<p class="govuk-body" id="important-section">text</p>`

---

### 3. Heading Component

**Purpose**: Section headings (h1-h6)

```
{
  "component": "heading",
  "text": "Land parcel rules checks",
  "level": 2,
  "classes": "govuk-!-margin-top-6",
  "id": "main-heading"
}
```

**Parameters**:

- `text` (required): Heading text
- `level` (optional): Heading level 1-6 (defaults to 1)
- `classes` (optional): Additional CSS classes
- `id` (optional): HTML ID attribute

**Output**: `<h2 class="govuk-heading-l govuk-!-margin-top-6" id="main-heading">text</h2>`

---

### 4. Status Component

**Purpose**: Status tags/badges

```
{
  "component": "status",
  "text": "PENDING_REVIEW",
  "colour": "blue",
  "labelsMap": {
    "PENDING_REVIEW": "Under Review",
    "APPROVED": "Approved"
  },
  "classesMap": {
    "PENDING_REVIEW": "govuk-tag--yellow",
    "APPROVED": "govuk-tag--green"
  },
  "classes": "custom-class"
}
```

**Parameters**:

- `text` (required): Status value
- `colour` (optional): Colour name (converts to `govuk-tag--{colour}`)
- `labelsMap` (optional): Maps status values to display text
- `classesMap` (optional): Maps status values to CSS classes (overrides `colour`)
- `classes` (optional): Additional CSS classes

**Priority**: `classesMap` → `colour` → `govuk-tag--grey` (default)

**Output**: `<strong class="govuk-tag govuk-tag--yellow">Under Review</strong>`

---

### 5. URL Component

**Purpose**: Links

```
{
  "component": "url",
  "href": "https://example.com/document.pdf",
  "text": "View detailed check data (PDF)",
  "target": "_blank",
  "rel": "noopener",
  "classes": "custom-link-class"
}
```

**Parameters**:

- `href` (required): Link URL
- `text` (required): Link text
- `target` (optional): Link target (e.g., `"_blank"`)
- `rel` (optional): Link relationship (e.g., `"noopener"`)
- `classes` (optional): Additional CSS classes

**Output**: `<a href="https://example.com/document.pdf" target="_blank" rel="noopener" class="govuk-link custom-link-class">View detailed check data (PDF)</a>`

---

### 6. Ordered List Component

**Purpose**: Numbered lists

```
{
  "component": "ordered-list",
  "items": [
    {
      "text": "Applicant has applied for more than the total available area."
    },
    {
      "component": "paragraph",
      "text": "Complex item with nested component"
    }
  ],
  "classes": "govuk-list govuk-list--number",
  "id": "failure-reasons"
}
```

**Parameters**:

- `items` (required): Array of list items (can be simple objects with `text` or full components)
- `classes` (optional): CSS classes (defaults to `govuk-list govuk-list--number`)
- `id` (optional): HTML ID attribute

**Output**: `<ol class="govuk-list govuk-list--number">...</ol>`

---

### 7. Unordered List Component

**Purpose**: Bulleted lists

```
{
  "component": "unordered-list",
  "items": [
    { "text": "First item" },
    { "text": "Second item" }
  ],
  "classes": "govuk-list govuk-list--bullet",
  "id": "example-list"
}
```

**Parameters**:

- `items` (required): Array of list items
- `classes` (optional): CSS classes (defaults to `govuk-list govuk-list--bullet`)
- `id` (optional): HTML ID attribute

**Output**: `<ul class="govuk-list govuk-list--bullet">...</ul>`

---

### 8. Summary List Component

**Purpose**: Key-value pairs in GOV.UK summary list format

```
{
  "component": "summary-list",
  "title": "Check details",
  "rows": [
    {
      "label": "Parcel ID",
      "text": "SO3757 3059"
    },
    {
      "label": [
        { "component": "text", "text": "Status " },
        { "component": "status", "text": "URGENT", "colour": "red" }
      ],
      "text": [
        { "component": "text", "text": "100 ha " },
        { "component": "status", "text": "PASSED", "colour": "green" },
        { "component": "text", "text": " - " },
        { "component": "url", "href": "/details", "text": "View details" }
      ]
    }
  ]
}
```

**Parameters**:

- `rows` (required): Array of row objects with `label` and `text`
- `title` (optional): Heading above the summary list (renders as h3)

**Row Structure**:

- `label` (required): String OR array of dynamic components for the row label
- `text` (required): String OR array of dynamic components for the row value

**Flexible Syntax**:

Both `label` and `text` support two formats for maximum flexibility:

1. **Simple string** (for convenience):

   ```
   {
     "label": "Name",
     "text": "John Smith"
   }
   ```

2. **Array of components** (for rich content):
   ```
   {
     "label": [
       { "component": "text", "text": "Priority " },
       { "component": "status", "text": "HIGH", "colour": "red" }
     ],
     "text": [
       { "component": "status", "text": "COMPLETED", "colour": "green" },
       { "component": "text", "text": " - " },
       { "component": "url", "href": "/view", "text": "View details" }
     ]
   }
   ```

---

### 9. Details Component

**Purpose**: Expandable/collapsible content

```
{
  "component": "details",
  "summaryItems": [
    {
      "text": "Available area check",
      "classes": "govuk-details__summary-text"
    },
    {
      "component": "status",
      "text": "Failed",
      "colour": "red",
      "classes": "govuk-!-margin-left-8"
    }
  ],
  "items": [
    {
      "component": "heading",
      "text": "Result",
      "level": 3
    },
    {
      "component": "paragraph",
      "text": "Detailed explanation here"
    }
  ],
  "open": false,
  "id": "check-details"
}
```

**Parameters**:

- `summaryItems` (required): Array of components for the clickable summary
- `items` (required): Array of components for the expandable content
- `open` (optional): Whether details are expanded by default
- `id` (optional): HTML ID attribute
- `classes` (optional): Additional CSS classes

**Output**: `<details class="govuk-details">...</details>`

---

### 10. Container Component

**Purpose**: Groups components with a wrapper div

```
{
  "component": "container",
  "items": [
    {
      "component": "heading",
      "text": "Container Title",
      "level": 3
    },
    {
      "component": "paragraph",
      "text": "Container content"
    }
  ],
  "classes": "govuk-body",
  "id": "grouped-content"
}
```

**Parameters**:

- `items` (required): Array of nested components
- `classes` (optional): CSS classes for the container div
- `id` (optional): HTML ID attribute

**Output**: `<div class="govuk-body" id="grouped-content">...</div>`

---

### 11. Table Component

**Purpose**: Tabular data in GOV.UK table format

```
{
  "component": "table",
  "title": "Check Results",
  "rows": [
    [
      { "label": "Check", "component": "text", "text": "Area validation" },
      { "label": "Result", "component": "status", "text": "PASSED", "colour": "green" }
    ],
    [
      { "label": "Check", "component": "text", "text": "Boundary check" },
      { "label": "Result", "component": "status", "text": "FAILED", "colour": "red" }
    ]
  ],
  "firstCellIsHeader": false
}
```

**Parameters**:

- `rows` (required): 2D array where each row contains column objects
- `title` (optional): Heading above the table (renders as h3)
- `firstCellIsHeader` (optional): Whether first cell in each row should be a header

**Row Structure**:

- First row defines column headers via `label` field
- Each cell can contain any dynamic component (text, status, url, etc.)
- Cells support the full component system with nesting

**Output**: GOV.UK Table component with optional heading

---

### 12. Accordion Component

**Purpose**: Collapsible sections to progressively reveal content

```
{
  "component": "accordion",
  "id": "static-accordion",
  "items": [
    {
      "heading": [
        { "component": "text", "text": "Section 1" }
      ],
      "summary": [
        { "component": "text", "text": "Optional summary text" }
      ],
      "expanded": false,
      "content": [
        {
          "component": "paragraph",
          "text": "Content here"
        }
      ]
    },
    {
      "heading": [
        { "component": "text", "text": "Payment details " },
        { "component": "status", "text": "OVERDUE", "colour": "red" }
      ],
      "summary": [
        { "component": "text", "text": "Action required" }
      ],
      "content": [
        {
          "component": "heading",
          "text": "Outstanding balance",
          "level": 3
        },
        {
          "component": "unordered-list",
          "items": [
            { "text": "Invoice #123: £500" },
            { "text": "Invoice #124: £300" }
          ]
        }
      ]
    }
  ],
  "classes": "custom-accordion-class"
}
```

**Parameters**:

- `items` (required): Array of accordion section objects
- `id` (optional): HTML ID attribute (defaults to `accordion-default`)
- `classes` (optional): Additional CSS classes
- `rememberExpanded` (optional): Whether to remember expanded/collapsed state in browser sessionStorage (defaults to `true` if not specified)

**Item Structure**:

- `heading` (required): Array of dynamic components for the section heading
- `content` (required): Array of dynamic components to display in the section
- `summary` (optional): Array of dynamic components for additional context shown in collapsed state
- `expanded` (optional): Boolean to control if section is open by default

**State Persistence**:

By default, GOV.UK Frontend remembers which accordion sections are expanded when users navigate away and return to the page (within the same session). This uses browser sessionStorage.

To disable this behavior and always start with sections collapsed:

```
{
  "component": "accordion",
  "id": "my-accordion",
  "rememberExpanded": false,
  "items": [...]
}
```

**Output**: `<div class="govuk-accordion" data-module="govuk-accordion">...</div>`

---

### 13. Line Break Component

**Purpose**: Inserts a line break to control text flow and layout

```
{
  "component": "line-break"
}
```

**Parameters**: None

**Use Cases**:

- Force line breaks within containers for layout control
- Create vertical spacing between inline elements
- Control text flow without additional CSS
- Break up related content visually

**Output**: `<br>`

**Example: Mixed inline content with line breaks**:

```
{
  "component": "container",
  "items": [
    {
      "component": "status",
      "text": "COMPLETE",
      "colour": "green"
    },
    {
      "component": "text",
      "text": " - Task finished successfully"
    },
    {
      "component": "line-break"
    },
    {
      "component": "url",
      "href": "/next",
      "text": "Continue to next step"
    }
  ]
}
```

**Example: Creating vertical spacing with multiple line breaks**:

```
{
  "component": "container",
  "items": [
    {
      "component": "heading",
      "text": "Section Title",
      "level": 3
    },
    {
      "component": "line-break"
    },
    {
      "component": "line-break"
    },
    {
      "component": "paragraph",
      "text": "Content with extra spacing above"
    }
  ]
}
```

**Notes**:

- Simple semantic HTML `<br>` element
- No parameters required - just specify the component type
- Can be used multiple times consecutively for additional vertical space
- Particularly useful in containers to control layout without custom CSS

---

### GOV.UK Design System Reference

For complete styling options, refer to the [GOV.UK Design System Styles](https://design-system.service.gov.uk/styles/).

All `classes` parameters support GOV.UK utility classes and component-specific classes

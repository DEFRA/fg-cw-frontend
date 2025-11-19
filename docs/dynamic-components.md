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

**Example with component-based head configuration**:

```
{
  "component": "table",
  "title": "Assessment Results",
  "head": [
    {
      "component": "text",
      "text": "Assessment Type",
      "headerClasses": "govuk-!-width-one-third"
    },
    {
      "component": "status",
      "text": "Status",
      "colour": "blue",
      "classes": "govuk-!-font-weight-bold",
      "headerClasses": "sortable-header",
      "attributes": { "data-sortable": "true" }
    },
    {
      "component": "text",
      "text": "Score",
      "format": "numeric"
    },
    {
      "component": "text",
      "text": "Action",
      "headerClasses": "govuk-visually-hidden"
    }
  ],
  "rows": [
    [
      { "component": "text", "text": "Area validation" },
      { "component": "status", "text": "PASSED", "colour": "green" },
      { "component": "text", "text": "95%" },
      { "component": "text", "text": "View details" }
    ],
    [
      { "component": "text", "text": "Boundary check" },
      { "component": "status", "text": "FAILED", "colour": "red" },
      { "component": "text", "text": "72%" },
      { "component": "text", "text": "View details" }
    ]
  ]
}
```

**Example with mixed head items (components and plain objects)**:

```
{
  "component": "table",
  "title": "Mixed Head Example",
  "head": [
    {
      "component": "text",
      "text": "Dynamic Header",
      "classes": "govuk-!-font-weight-bold",
      "headerClasses": "govuk-!-width-one-half"
    },
    {
      "text": "Plain Header",
      "format": "numeric"
    },
    {
      "component": "status",
      "text": "Status",
      "colour": "green"
    }
  ],
  "rows": [
    [
      { "component": "text", "text": "Data 1" },
      { "component": "text", "text": "100" },
      { "component": "status", "text": "Active", "colour": "green" }
    ]
  ]
}
```

**Parameters**:

- `rows` (required): 2D array where each row contains column objects
- `head` (optional): Array of header cell objects with full GDS table support
- `title` (optional): Heading above the table (renders as h3)
- `firstCellIsHeader` (optional): Whether first cell in each row should be a header

**Head Cell Options**:

Head items can be either:

1. **Dynamic components** - Any dynamic component (text, status, etc.) with optional styling properties
2. **Plain GDS objects** - Standard GDS table head objects with text/html content

**Dynamic Component Head Items**:

- `component` (required): Component type (e.g., "text", "status")
- Component-specific properties (e.g., `text`, `colour` for status component)
- `classes` (optional): CSS classes for the component itself
- `headerClasses` (optional): CSS classes for the table header cell (`<th>`)
- `format` (optional): Adds `govuk-table__header--{format}` class (e.g., "numeric")
- `colspan` (optional): Column span attribute
- `rowspan` (optional): Row span attribute
- `attributes` (optional): Object of additional HTML attributes

**Plain GDS Head Objects**:

- `text` (optional): Plain text content
- `html` (optional): HTML content (takes precedence over text)
- `classes` (optional): Additional CSS classes
- `format` (optional): Adds `govuk-table__header--{format}` class (e.g., "numeric")
- `colspan` (optional): Column span attribute
- `rowspan` (optional): Row span attribute
- `attributes` (optional): Object of additional HTML attributes

**Row Structure**:

- If `head` is not provided, first row defines column headers via `label` field
- Each cell can contain any dynamic component (text, status, url, etc.)
- Cells support the full component system with nesting

**Output**: GOV.UK Table component with optional heading

**Note**: For component-based head items, `classes` applies to the component content while `headerClasses` applies to the `<th>` element. This allows separate styling for the header cell and its content.

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

### 14. Repeat Component

**Purpose**: Iterate over an array and repeat content for each item without adding a wrapper element. This is a control-flow component that flattens its output into the parent container.

```json
{
  "component": "repeat",
  "itemsRef": "@.actions[*]",
  "items": [
    {
      "label": "Action",
      "text": "@.description"
    },
    {
      "label": "Action code",
      "text": "@.code"
    }
  ]
}
```

**Parameters**:

- `component` (required): Must be `"repeat"`
- `itemsRef` (required): JSONPath expression pointing to an array. Must use `[*]` wildcard to iterate over items.
  - Root reference: `"$.parcels[*]"` (from document root)
  - Row reference: `"@.actions[*]"` (from current row context)
- `items` (required): Array of component definitions to repeat for each item. Can be a single object or array of objects.

**Behavior**:

- Iterates over each item in the referenced array
- For each item, resolves the `items` template with that item as the row context (`@.` references)
- Flattens all resolved items into the parent array (no wrapper element)
- Works inside any array context: summary list rows, table rows, accordion content, etc.

**Output**: Array of resolved components (flattened into parent)

---

**Example 1: Repeating Summary List Rows**

Input data:

```json
{
  "parcelId": "10001",
  "actions": [
    {
      "code": "CMOR1",
      "description": "Assess moorland",
      "annualPaymentPence": 35150
    },
    {
      "code": "UPL1",
      "description": "Upland management",
      "annualPaymentPence": 42000
    }
  ]
}
```

Workflow definition:

```json
{
  "component": "summary-list",
  "rows": [
    {
      "label": "Land parcel",
      "text": "@.parcelId"
    },
    {
      "component": "repeat",
      "itemsRef": "@.actions[*]",
      "items": [
        {
          "label": "Action",
          "text": "@.description"
        },
        {
          "label": "Action code",
          "text": "@.code"
        },
        {
          "label": "Annual payment",
          "text": "@.annualPaymentPence",
          "format": "penniesToPounds"
        }
      ]
    }
  ]
}
```

Resolved output (what gets rendered):

```json
{
  "component": "summary-list",
  "rows": [
    {
      "label": "Land parcel",
      "text": "10001"
    },
    {
      "label": "Action",
      "text": "Assess moorland"
    },
    {
      "label": "Action code",
      "text": "CMOR1"
    },
    {
      "label": "Annual payment",
      "text": "£351.50"
    },
    {
      "label": "Action",
      "text": "Upland management"
    },
    {
      "label": "Action code",
      "text": "UPL1"
    },
    {
      "label": "Annual payment",
      "text": "£420.00"
    }
  ]
}
```

---

**Example 2: Nested Repeat in Accordion**

Input data:

```json
{
  "parcels": [
    {
      "parcelId": "10001",
      "actions": [
        { "code": "CMOR1", "description": "Assess moorland" },
        { "code": "CMOR2", "description": "Restore moorland" }
      ]
    },
    {
      "parcelId": "10002",
      "actions": [{ "code": "UPL1", "description": "Upland management" }]
    }
  ]
}
```

Workflow definition:

```json
{
  "component": "accordion",
  "itemsRef": "$.parcels[*]",
  "items": {
    "heading": [
      {
        "text": "@.parcelId"
      }
    ],
    "content": [
      {
        "component": "summary-list",
        "rows": [
          {
            "component": "repeat",
            "itemsRef": "@.actions[*]",
            "items": [
              {
                "label": "Action",
                "text": "@.description"
              },
              {
                "label": "Code",
                "text": "@.code"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

Result: An accordion with 2 sections (one per parcel), each containing a summary list with repeated action rows.

---

**Example 3: Simple List Repeat**

```json
{
  "component": "repeat",
  "itemsRef": "$.tags[*]",
  "items": {
    "component": "paragraph",
    "text": "@."
  }
}
```

When `$.tags` is `["organic", "upland", "woodland"]`, this creates 3 paragraph components.

---

**Notes**:

- The `repeat` component is transparent - it doesn't render its own HTML element
- Always use `[*]` in `itemsRef` to iterate over array items
- Within the `items` template, use `@.` to reference fields on the current item
- Can be nested inside accordions, tables, or other repeat components
- The `items` property can be a single component or an array of components

---

### GOV.UK Design System Reference

For complete styling options, refer to the [GOV.UK Design System Styles](https://design-system.service.gov.uk/styles/).

All `classes` parameters support GOV.UK utility classes and component-specific classes

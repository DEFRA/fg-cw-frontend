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
  "classes": "custom-link-class"
}
```

**Parameters**:

- `href` (required): Link URL
- `text` (required): Link text
- `classes` (optional): Additional CSS classes

**Output**: `<a href="https://example.com/document.pdf" class="govuk-link custom-link-class">View detailed check data (PDF)</a>`

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
      "label": "Total size",
      "component": "status",
      "text": "100 ha",
      "colour": "green"
    }
  ]
}
```

**Parameters**:

- `rows` (required): Array of row objects with `label` and content
- `title` (optional): Heading above the summary list

**Row objects can be**:

- Simple: `{ "label": "Key", "text": "Value" }`
- Component-based: `{ "label": "Key", "component": "status", ... }`

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

### GOV.UK Design System Reference

For complete styling options, refer to the [GOV.UK Design System Styles](https://design-system.service.gov.uk/styles/).

All `classes` parameters support GOV.UK utility classes and component-specific classes

### Component Nesting

Components can contain other components via `items` arrays:

```
{
  "component": "details",
  "summaryItems": [{ "component": "status", ... }],
  "items": [
    { "component": "heading", ... },
    { "component": "summary-list", ... }
  ]
}
```

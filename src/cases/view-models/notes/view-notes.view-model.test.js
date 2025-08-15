import { describe, expect, it } from "vitest";
import { createViewNotesViewModel } from "./view-notes.view-model.js";

describe("createViewNotesViewModel", () => {
  it("creates complete view model with notes", () => {
    const mockCaseItem = createMockCaseItem({
      comments: [
        {
          createdAt: "2025-01-01T10:00:00.000Z",
          createdBy: "John Smith",
          title: "NOTE_ADDED",
          text: "This is a test note",
        },
        {
          createdAt: "2025-01-02T15:30:00.000Z",
          createdBy: "Jane Doe",
          title: "REVIEW_COMPLETED",
          text: "Review has been completed successfully",
        },
      ],
    });

    const result = createViewNotesViewModel(mockCaseItem);

    expect(result.pageTitle).toBe("Notes banana-123");
    expect(result.pageHeading).toBe("Notes");
    expect(result.breadcrumbs).toEqual([]);
    expect(result.data.caseId).toBe("68495db5afe2d27b09b2ee47");
    expect(result.data.banner).toBeDefined();
    expect(result.data.notes.title).toBe("All notes");
    expect(result.data.notes.rows).toHaveLength(2);
    expect(result.errors).toBeUndefined();
  });

  it("creates correct table structure for notes", () => {
    const mockCaseItem = createMockCaseItem({
      comments: [
        {
          ref: "note-123",
          createdAt: "2025-01-01T10:00:00.000Z",
          createdBy: "John Smith",
          title: "NOTE_ADDED",
          text: "This is a test note",
        },
      ],
    });

    const result = createViewNotesViewModel(mockCaseItem, "note-123");

    expect(result.data.notes.head).toEqual([
      {
        text: "Date",
        attributes: {
          "aria-sort": "descending",
        },
      },
      {
        text: "Type",
        attributes: {
          "aria-sort": "ascending",
        },
      },
      {
        text: "Note",
        classes: "govuk-!-width-one-half",
      },
      {
        text: "Added by",
        attributes: {
          "aria-sort": "ascending",
        },
      },
    ]);

    expect(result.data.notes.rows[0]).toEqual({
      createdAt: {
        ref: "note-123",
        sortValue: "2025-01-01",
        text: "01 Jan 2025",
      },
      type: {
        text: "NOTE_ADDED",
      },
      note: {
        ref: "note-123",
        href: "?selectedNoteRef=note-123#note-note-123",
        isSelected: true,
        text: "This is a test note",
        classes: "wrap-all-text",
      },
      addedBy: {
        text: "John Smith",
      },
    });
  });
});

const createMockCaseItem = (overrides = {}) => ({
  _id: "68495db5afe2d27b09b2ee47",
  caseRef: "banana-123",
  banner: { mockBanner: "data" },
  comments: [
    {
      createdAt: "2025-01-01T10:00:00.000Z",
      createdBy: "John Smith",
      title: "NOTE_ADDED",
      text: "This is a test note",
    },
  ],
  ...overrides,
});

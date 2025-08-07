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

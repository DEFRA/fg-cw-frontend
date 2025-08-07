import { describe, expect, it } from "vitest";
import { createNewNoteViewModel } from "./new-note.view-model.js";

describe("createNewNoteViewModel", () => {
  it("creates complete view model", () => {
    const mockCaseItem = createMockCaseItem();

    const result = createNewNoteViewModel(mockCaseItem);

    expect(result.pageTitle).toBe("New Note banana-123");
    expect(result.pageHeading).toBe("Add a note");
    expect(result.breadcrumbs).toEqual([]);
    expect(result.data.caseId).toBe("68495db5afe2d27b09b2ee47");
    expect(result.data.banner).toBeDefined();
    expect(result.errors).toBeUndefined();
  });

  it("includes errors when provided", () => {
    const mockCaseItem = createMockCaseItem();
    const mockErrors = { text: "You must enter a note" };

    const result = createNewNoteViewModel(mockCaseItem, mockErrors);

    expect(result.errors).toEqual(mockErrors);
  });
});

const createMockCaseItem = (overrides = {}) => ({
  _id: "68495db5afe2d27b09b2ee47",
  caseRef: "banana-123",
  banner: { mockBanner: "data" },
  ...overrides,
});

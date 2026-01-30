import { describe, expect, it, vi } from "vitest";
import { createMockCaseData } from "../../../../test/data/case-test-data.js";
import { createNewNoteViewModel } from "./new-note.view-model.js";

vi.mock("../../../common/view-models/header.view-model.js");

const mockRequest = { path: "/cases/68495db5afe2d27b09b2ee47/notes/new" };

const createMockPage = (caseData) => ({
  data: caseData,
  header: { navItems: [] },
});

describe("new-note.view-model", () => {
  describe("createNewNoteViewModel", () => {
    it("creates complete view model", () => {
      const mockCaseItem = createMockCaseData();

      const result = createNewNoteViewModel({
        page: createMockPage(mockCaseItem),
        request: mockRequest,
      });

      expect(result.pageTitle).toBe("New Note banana-123");
      expect(result.pageHeading).toBe("Add a note");
      expect(result.breadcrumbs).toEqual([]);
      expect(result.data.caseId).toBe("68495db5afe2d27b09b2ee47");
      expect(result.data.banner).toBeDefined();
      expect(result.data.formData).toEqual({});
      expect(result.errors).toBeUndefined();
      expect(result.errorList).toEqual([]);
    });

    it("includes form data when provided", () => {
      const mockCaseItem = createMockCaseData();
      const mockFormData = {
        text: "User's input text",
      };

      const result = createNewNoteViewModel({
        page: createMockPage(mockCaseItem),
        request: mockRequest,
        errors: null,
        formData: mockFormData,
      });

      expect(result.data.formData).toEqual(mockFormData);
    });

    it("preserves user input on save error", () => {
      const mockCaseItem = createMockCaseData();
      const mockErrors = {
        save: "There was a problem saving the note. Please try again.",
      };
      const mockFormData = {
        text: "User typed this long note and doesn't want to lose it",
      };

      const result = createNewNoteViewModel({
        page: createMockPage(mockCaseItem),
        request: mockRequest,
        errors: mockErrors,
        formData: mockFormData,
      });

      expect(result.data.formData.text).toBe(
        "User typed this long note and doesn't want to lose it",
      );
      expect(result.errorList[0].text).toBe(
        "There was a problem saving the note. Please try again.",
      );
    });

    it("builds error list with text error", () => {
      const mockCaseItem = createMockCaseData();
      const mockErrors = { text: "You must add a note" };

      const result = createNewNoteViewModel({
        page: createMockPage(mockCaseItem),
        request: mockRequest,
        errors: mockErrors,
      });

      expect(result.errorList).toEqual([
        {
          text: "You must add a note",
          href: "#text",
        },
      ]);
    });

    it("builds error list with save error", () => {
      const mockCaseItem = createMockCaseData();
      const mockErrors = {
        save: "There was a problem saving the note. Please try again.",
      };

      const result = createNewNoteViewModel({
        page: createMockPage(mockCaseItem),
        request: mockRequest,
        errors: mockErrors,
      });

      expect(result.errorList).toEqual([
        {
          text: "There was a problem saving the note. Please try again.",
        },
      ]);
    });

    it("builds empty error list when no errors", () => {
      const mockCaseItem = createMockCaseData();

      const result = createNewNoteViewModel({
        page: createMockPage(mockCaseItem),
        request: mockRequest,
      });

      expect(result.errorList).toEqual([]);
    });
  });
});

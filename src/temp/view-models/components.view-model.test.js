import { describe, expect, it, vi } from "vitest";
import {
  createComponentsEditViewModel,
  createComponentsViewModel,
} from "./components.view-model.js";

vi.mock("../../common/view-models/header.view-model.js");

const mockRequest = { path: "/cases/case-123/components" };

const createMockPage = (caseData) => ({
  data: caseData,
  header: { navItems: [] },
});

const buildCaseItem = (overrides = {}) => ({
  _id: "case-123",
  caseRef: "REF-123",
  banner: { title: { text: "Ref 123" } },
  links: [
    { id: "tasks", text: "Tasks", href: "/cases/case-123", active: false },
  ],
  ...overrides,
});

describe("components.view-model", () => {
  describe("createComponentsViewModel", () => {
    it("adds the components navigation link when it is missing", () => {
      const caseItem = buildCaseItem();

      const viewModel = createComponentsViewModel({
        page: createMockPage(caseItem),
        request: mockRequest,
        content: [{ id: "component-1" }],
      });

      expect(viewModel.pageTitle).toBe("Components REF-123");
      expect(viewModel.pageHeading).toBe("Components");
      expect(viewModel.breadcrumbs).toEqual([]);
      expect(viewModel.data.banner).toEqual(caseItem.banner);
      expect(viewModel.data.caseRef).toBe("REF-123");
      expect(viewModel.data.caseId).toBe("case-123");
      expect(viewModel.data.content).toEqual([{ id: "component-1" }]);
      expect(viewModel.data.links).toEqual([
        {
          id: "tasks",
          text: "Tasks",
          href: "/cases/case-123",
          active: false,
        },
        {
          id: "components",
          text: "Components",
          href: "/cases/case-123/components",
          active: true,
        },
      ]);
    });
  });

  describe("createComponentsEditViewModel", () => {
    it("includes form data and validation errors", () => {
      const caseItem = buildCaseItem();
      const errors = { jsonPayload: "Enter a JSON payload" };

      const viewModel = createComponentsEditViewModel({
        page: createMockPage(caseItem),
        request: mockRequest,
        formData: {
          jsonPayload: '{"foo":"bar"}',
        },
        errors,
      });

      expect(viewModel.errors).toEqual(errors);
      expect(viewModel.errorList).toEqual([
        {
          text: "Enter a JSON payload",
          href: "#jsonPayload",
        },
      ]);
      expect(viewModel.data.formData).toEqual({
        jsonPayload: '{"foo":"bar"}',
      });
      expect(viewModel.data.content).toBeUndefined();
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  createComponentsEditViewModel,
  createComponentsViewModel,
} from "./components.view-model.js";

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

      const viewModel = createComponentsViewModel(caseItem, [
        { id: "component-1" },
      ]);

      expect(viewModel).toEqual({
        pageTitle: "Components REF-123",
        pageHeading: "Components",
        breadcrumbs: [],
        data: {
          banner: caseItem.banner,
          caseRef: "REF-123",
          caseId: "case-123",
          links: [
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
          ],
          content: [{ id: "component-1" }],
        },
      });
    });
  });

  describe("createComponentsEditViewModel", () => {
    it("includes form data and validation errors", () => {
      const caseItem = buildCaseItem();
      const errors = { jsonPayload: "Enter a JSON payload" };

      const viewModel = createComponentsEditViewModel(caseItem, {
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

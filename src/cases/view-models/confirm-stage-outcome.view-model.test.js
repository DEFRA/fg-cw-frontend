import { describe, expect, it, vi } from "vitest";
import { createConfirmStageOutcomeViewModel } from "./confirm-stage-outcome.view-model.js";

vi.mock("../../common/helpers/navigation-helpers.js", () => ({
  setActiveLink: vi.fn((links) => links),
}));

vi.mock("../../common/view-models/header.view-model.js", () => ({
  createHeaderViewModel: vi.fn(() => ({ header: "mocked" })),
}));

describe("createConfirmStageOutcomeViewModel", () => {
  const createMockPage = (actionOverrides = {}) => ({
    data: {
      _id: "case-123",
      caseRef: "CASE-REF-123",
      stage: {
        actions: [
          {
            code: "REJECT_APPLICATION",
            name: "Reject",
            targetStatusName: "Rejected",
            confirm: {
              details: [],
              yes: null,
              no: null,
            },
            ...actionOverrides,
          },
        ],
      },
      links: [],
    },
  });

  const mockRequest = {
    url: { pathname: "/cases/case-123/stage/outcome/confirm" },
  };

  it("should create view model with default confirmation config", () => {
    const page = createMockPage();

    const viewModel = createConfirmStageOutcomeViewModel({
      page,
      request: mockRequest,
      actionCode: "REJECT_APPLICATION",
    });

    expect(viewModel.pageTitle).toBe("Confirm action - Reject");
    expect(viewModel.data.caseId).toBe("case-123");
    expect(viewModel.data.actionCode).toBe("REJECT_APPLICATION");
    expect(viewModel.data.confirmConfig.title).toBe(
      "Change status to 'Rejected'?",
    );
    expect(viewModel.data.confirmConfig.details).toEqual([]);
    expect(viewModel.data.confirmConfig.yes).toEqual({
      label: "Yes",
      components: null,
    });
    expect(viewModel.data.confirmConfig.no).toEqual({
      label: "No",
      components: null,
    });
  });

  it("should handle confirm: true", () => {
    const page = createMockPage({ confirm: true });

    const viewModel = createConfirmStageOutcomeViewModel({
      page,
      request: mockRequest,
      actionCode: "REJECT_APPLICATION",
    });

    expect(viewModel.data.confirmConfig.title).toBe(
      "Change status to 'Rejected'?",
    );
    expect(viewModel.data.confirmConfig.yes.label).toBe("Yes");
    expect(viewModel.data.confirmConfig.no.label).toBe("No");
  });

  it("should handle confirm with custom details", () => {
    const customDetails = [
      {
        component: "heading",
        text: "Are you sure?",
        level: 2,
      },
      {
        component: "paragraph",
        text: "This action cannot be undone.",
      },
    ];

    const page = createMockPage({
      confirm: {
        details: customDetails,
        yes: null,
        no: null,
      },
    });

    const viewModel = createConfirmStageOutcomeViewModel({
      page,
      request: mockRequest,
      actionCode: "REJECT_APPLICATION",
    });

    expect(viewModel.data.confirmConfig.details).toEqual(customDetails);
  });

  it("should handle confirm with string yes/no labels", () => {
    const page = createMockPage({
      confirm: {
        details: [],
        yes: "Yes, reject this application",
        no: "No, keep reviewing",
      },
    });

    const viewModel = createConfirmStageOutcomeViewModel({
      page,
      request: mockRequest,
      actionCode: "REJECT_APPLICATION",
    });

    expect(viewModel.data.confirmConfig.yes).toEqual({
      label: "Yes, reject this application",
      components: null,
    });
    expect(viewModel.data.confirmConfig.no).toEqual({
      label: "No, keep reviewing",
      components: null,
    });
  });

  it("should handle confirm with component-based yes/no options", () => {
    const yesComponent = {
      component: "container",
      items: [
        { component: "text", text: "Yes, I want to reject" },
        { component: "text", text: "This is final" },
      ],
    };

    const page = createMockPage({
      confirm: {
        details: [],
        yes: yesComponent,
        no: "No",
      },
    });

    const viewModel = createConfirmStageOutcomeViewModel({
      page,
      request: mockRequest,
      actionCode: "REJECT_APPLICATION",
    });

    expect(viewModel.data.confirmConfig.yes).toEqual({
      label: null,
      components: yesComponent,
    });
  });

  it("should preserve comment from formData", () => {
    const page = createMockPage();

    const viewModel = createConfirmStageOutcomeViewModel({
      page,
      request: mockRequest,
      actionCode: "REJECT_APPLICATION",
      formData: {
        "REJECT_APPLICATION-comment": "This is my rejection reason",
      },
    });

    expect(viewModel.data.comment).toBe("This is my rejection reason");
  });

  it("should include errors in view model", () => {
    const page = createMockPage();
    const errors = {
      confirmation: { text: "Select an option", href: "#confirmation" },
    };

    const viewModel = createConfirmStageOutcomeViewModel({
      page,
      request: mockRequest,
      actionCode: "REJECT_APPLICATION",
      errors,
    });

    expect(viewModel.errors).toEqual(errors);
    expect(viewModel.errorList).toEqual([
      { text: "Select an option", href: "#confirmation" },
    ]);
  });

  it("should throw error when action not found", () => {
    const page = createMockPage();

    expect(() =>
      createConfirmStageOutcomeViewModel({
        page,
        request: mockRequest,
        actionCode: "NON_EXISTENT_ACTION",
      }),
    ).toThrow('Action "NON_EXISTENT_ACTION" not found');
  });

  it("should use action name as fallback when targetStatusName is not available", () => {
    const page = createMockPage({
      targetStatusName: null,
      confirm: true,
    });

    const viewModel = createConfirmStageOutcomeViewModel({
      page,
      request: mockRequest,
      actionCode: "REJECT_APPLICATION",
    });

    expect(viewModel.data.confirmConfig.title).toBe(
      "Change status to 'Reject'?",
    );
  });

  it("should include breadcrumbs", () => {
    const page = createMockPage();

    const viewModel = createConfirmStageOutcomeViewModel({
      page,
      request: mockRequest,
      actionCode: "REJECT_APPLICATION",
    });

    expect(viewModel.breadcrumbs).toEqual([
      { text: "Cases", href: "/cases" },
      { text: "CASE-REF-123", href: "/cases/case-123" },
      { text: "Confirm" },
    ]);
  });
});

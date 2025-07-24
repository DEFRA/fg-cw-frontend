import { describe, expect, it, vi } from "vitest";
import { getFormattedGBDate } from "../../common/helpers/date-helpers.js";
import { createCaseDetailViewModel } from "./case-detail.view-model.js";

vi.mock("../../common/helpers/date-helpers.js");

describe("createCaseDetailViewModel", () => {
  it("creates view model with all case properties", () => {
    const mockCase = {
      _id: "case-123",
      caseRef: "CLIENT-REF-001",
      workflowCode: "CASE-CODE-001",
      submittedAt: "2021-01-15T00:00:00.000Z",
      dateReceived: "2021-01-10T00:00:00.000Z",
      status: "In Progress",
      assignedUser: "john doe",
      overrideTabs: [],
      payload: {
        answers: {
          agreementName: "Test Agreement",
          scheme: "Test Scheme",
        },
        identifiers: {
          sbi: "123456789",
        },
        submittedAt: "2021-01-15T00:00:00.000Z",
      },
    };

    getFormattedGBDate.mockReturnValue("15/01/2021");

    const result = createCaseDetailViewModel(mockCase);

    expect(result).toEqual({
      pageTitle: "Case CLIENT-REF-001",
      pageHeading: "Case CLIENT-REF-001",
      breadcrumbs: [],
      data: {
        case: {
          _id: "case-123",
          clientRef: "CLIENT-REF-001",
          businessName: "Test Agreement",
          code: "CASE-CODE-001",
          sbi: "123456789",
          scheme: "Test Scheme",
          dateReceived: "2021-01-10T00:00:00.000Z",
          submittedAt: "15/01/2021",
          status: "In Progress",
          assignedUser: "john doe",
          payload: mockCase.payload,
          caseDetails: undefined,
        },
      },
    });

    expect(getFormattedGBDate).toHaveBeenCalledWith("2021-01-15T00:00:00.000Z");
    expect(getFormattedGBDate).toHaveBeenCalledTimes(1);
  });

  it("creates view model with minimal case properties", () => {
    const mockCase = {
      _id: "case-minimal",
      caseRef: "MIN-001",
      workflowCode: "MIN-CODE",
      status: "In Progress",
      assignedUser: "Unassigned",
      overrideTabs: [],
      payload: {},
    };

    getFormattedGBDate.mockReturnValue("Not submitted");

    const result = createCaseDetailViewModel(mockCase);

    expect(result).toEqual({
      pageTitle: "Case MIN-001",
      pageHeading: "Case MIN-001",
      breadcrumbs: [],
      data: {
        case: {
          _id: "case-minimal",
          clientRef: "MIN-001",
          businessName: undefined,
          code: "MIN-CODE",
          sbi: undefined,
          scheme: undefined,
          dateReceived: undefined,
          submittedAt: "Not submitted",
          status: "In Progress",
          assignedUser: "Unassigned",
          payload: {},
          caseDetails: undefined,
        },
      },
    });

    expect(getFormattedGBDate).toHaveBeenCalledWith(undefined);
  });

  it("creates view model using payload submittedAt when main submittedAt is missing", () => {
    const mockCase = {
      _id: "case-payload-date",
      caseRef: "PAYLOAD-001",
      workflowCode: "PAYLOAD-CODE",
      status: "Completed",
      assignedUser: "jane smith",
      overrideTabs: [],
      payload: {
        submittedAt: "2021-03-20T00:00:00.000Z",
        answers: {
          agreementName: "Payload Agreement",
        },
      },
    };

    getFormattedGBDate.mockReturnValue("20/03/2021");

    const result = createCaseDetailViewModel(mockCase);

    expect(result.data.case.status).toBe("Completed");
    expect(result.data.case.assignedUser).toBe("jane smith");
    expect(result.data.case.submittedAt).toBe("20/03/2021");
    expect(result.data.case.businessName).toBe("Payload Agreement");
    expect(result.data.case.caseDetails).toBe(undefined);
    expect(getFormattedGBDate).toHaveBeenCalledWith("2021-03-20T00:00:00.000Z");
  });

  it("creates correct breadcrumbs structure", () => {
    const mockCase = {
      _id: "case-breadcrumb",
      caseRef: "BREAD-001",
      workflowCode: "BREAD-CODE",
      status: "In Progress",
      assignedUser: "Unassigned",
      overrideTabs: [],
      payload: {},
    };

    getFormattedGBDate.mockReturnValue("Not submitted");

    const result = createCaseDetailViewModel(mockCase);

    expect(result.breadcrumbs).toHaveLength(0);
    expect(result.breadcrumbs).toEqual([]);
  });

  it("creates consistent page title and heading", () => {
    const mockCase = {
      _id: "case-title",
      caseRef: "TITLE-001",
      workflowCode: "TITLE-CODE",
      status: "In Progress",
      assignedUser: "Unassigned",
      overrideTabs: [],
      payload: {},
    };

    getFormattedGBDate.mockReturnValue("Not submitted");

    const result = createCaseDetailViewModel(mockCase);

    expect(result.pageTitle).toBe("Case TITLE-001");
    expect(result.pageHeading).toBe("Case TITLE-001");
    expect(result.pageTitle).toBe(result.pageHeading);
  });

  it("calls date helper function exactly once", () => {
    const mockCase = {
      _id: "case-methods",
      caseRef: "METHOD-001",
      workflowCode: "METHOD-CODE",
      status: "Active",
      assignedUser: "test user",
      overrideTabs: [],
      payload: {
        submittedAt: "2021-01-01T00:00:00.000Z",
      },
    };

    getFormattedGBDate.mockReturnValue("01/01/2021");

    createCaseDetailViewModel(mockCase);

    expect(getFormattedGBDate).toHaveBeenCalledTimes(1);
    expect(getFormattedGBDate).toHaveBeenCalledWith("2021-01-01T00:00:00.000Z");
  });

  it("handles nested payload properties correctly", () => {
    const mockCase = {
      _id: "case-nested",
      caseRef: "NESTED-001",
      workflowCode: "NESTED-CODE",
      status: "Processing",
      assignedUser: "processor",
      overrideTabs: [],
      payload: {
        answers: {
          agreementName: "Complex Agreement",
          scheme: "Premium Scheme",
        },
        identifiers: {
          sbi: "987654321",
        },
      },
    };

    getFormattedGBDate.mockReturnValue("Not submitted");

    const result = createCaseDetailViewModel(mockCase);

    expect(result.data.case.businessName).toBe("Complex Agreement");
    expect(result.data.case.scheme).toBe("Premium Scheme");
    expect(result.data.case.sbi).toBe("987654321");
    expect(result.data.case.payload).toBe(mockCase.payload);
    expect(result.data.case.caseDetails).toBe(undefined);
  });

  it("finds caseDetails tab when overrideTabs contains matching tab", () => {
    const mockCaseDetailsTab = {
      id: "caseDetails",
      title: "Case Details",
      content: "Custom case details content",
    };

    const mockCase = {
      _id: "case-with-tabs",
      caseRef: "TABS-001",
      workflowCode: "TABS-CODE",
      status: "Active",
      assignedUser: "test user",
      overrideTabs: [
        { id: "otherTab", title: "Other Tab" },
        mockCaseDetailsTab,
        { id: "anotherTab", title: "Another Tab" },
      ],
      payload: {
        submittedAt: "2021-01-01T00:00:00.000Z",
      },
    };

    getFormattedGBDate.mockReturnValue("01/01/2021");

    const result = createCaseDetailViewModel(mockCase);

    expect(result.data.case.caseDetails).toBe(mockCaseDetailsTab);
  });
});

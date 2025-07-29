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
          title: "Case",
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
          title: "Case",
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
      sections: [
        {
          title: "Section 1",
          type: "list",
          fields: [
            {
              ref: "$.payload.answers.testField",
              type: "string",
              label: "Test Field",
            },
          ],
        },
      ],
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

    expect(result.data.case.caseDetails).toEqual({
      ...mockCaseDetailsTab,
      sections: [
        {
          title: "Section 1",
          type: "list",
          fields: [
            {
              key: {
                text: "Test Field",
              },
              value: {
                text: undefined,
              },
            },
          ],
        },
      ],
    });
  });

  it("converts boolean values to Yes/No in case details", () => {
    const mockCaseDetailsTab = {
      id: "caseDetails",
      title: "Case Details",
      sections: [
        {
          title: "Boolean Section",
          type: "list",
          fields: [
            {
              ref: "$.payload.answers.isPigFarmer",
              type: "boolean",
              label: "Are you a pig farmer?",
            },
            {
              ref: "$.payload.answers.hasLicense",
              type: "boolean",
              label: "Do you have a license?",
            },
          ],
        },
      ],
    };

    const mockCase = {
      _id: "case-with-booleans",
      caseRef: "BOOL-001",
      workflowCode: "BOOL-CODE",
      status: "Active",
      assignedUser: "test user",
      overrideTabs: [mockCaseDetailsTab],
      payload: {
        answers: {
          isPigFarmer: true,
          hasLicense: false,
        },
        submittedAt: "2021-01-01T00:00:00.000Z",
      },
    };

    getFormattedGBDate.mockReturnValue("01/01/2021");

    const result = createCaseDetailViewModel(mockCase);

    expect(result.data.case.caseDetails).toEqual({
      ...mockCaseDetailsTab,
      sections: [
        {
          title: "Boolean Section",
          type: "list",
          fields: [
            {
              key: {
                text: "Are you a pig farmer?",
              },
              value: {
                text: "Yes",
              },
            },
            {
              key: {
                text: "Do you have a license?",
              },
              value: {
                text: "No",
              },
            },
          ],
        },
      ],
    });
  });

  it("can map table section", () => {
    const mockTableSection = {
      title: "Action cases data table",
      type: "table",
      fields: [
        {
          ref: "$.payload.answers.actionApplications[*].parcelId",
          type: "string",
          label: "Parcel Id",
        },
        {
          ref: "$.payload.answers.actionApplications[*].sheetId",
          type: "string",
          label: "Sheet Id",
        },
        {
          ref: "$.payload.answers.actionApplications[*].code",
          type: "string",
          label: "Code",
        },
        {
          ref: "$.payload.answers.actionApplications[*].appliedFor",
          type: "string",
          label: "Applied For",
        },
      ],
    };
    const mockCase = createMockCaseWithSection(mockTableSection);

    const result = createCaseDetailViewModel(mockCase);

    expect(result.data.case.caseDetails.sections[0]).toEqual({
      type: "table",
      title: "Action cases data table",
      head: [
        {
          text: "Parcel Id",
        },
        {
          text: "Sheet Id",
        },
        {
          text: "Code",
        },
        {
          text: "Applied For",
        },
      ],
      rows: [
        [
          {
            text: "9238",
          },
          {
            text: "SX0679",
          },
          {
            text: "CSAM1",
          },
          {
            text: "[object Object]",
          },
        ],
        [
          {
            text: "9239",
          },
          {
            text: "SX0680",
          },
          {
            text: "CSAM2",
          },
          {
            text: "[object Object]",
          },
        ],
      ],
    });
  });
});

const createMockCaseWithSection = (section) => {
  return {
    caseRef: "fb7-33b-261",
    workflowCode: "frps-private-beta",
    status: "NEW",
    dateReceived: "2025-07-22T14:22:14.827+0000",
    overrideTabs: [
      { id: "caseDetails", title: "Case Details", sections: [section] },
    ],
    payload: {
      clientRef: "fb7-33b-261",
      code: "frps-private-beta",
      createdAt: "2025-07-22T14:22:14.717Z",
      submittedAt: "2025-07-22T14:22:14.659Z",
      identifiers: {
        sbi: "sbi",
        frn: "frn",
        crn: "crn",
        defraId: "defraId",
      },
      answers: {
        hasCheckedLandIsUpToDate: true,
        agreementName: "Mayank's Test 8",
        scheme: "SFI",
        year: 2025,
        actionApplications: [
          {
            code: "CSAM1",
            sheetId: "SX0679",
            parcelId: "9238",
            appliedFor: {
              unit: "ha",
              quantity: 20.23,
            },
          },
          {
            code: "CSAM2",
            sheetId: "SX0680",
            parcelId: "9239",
            appliedFor: {
              unit: "ha",
              quantity: 21.24,
            },
          },
        ],
      },
    },
    pages: {
      cases: {
        details: {
          banner: {
            summary: {
              sbi: {
                label: "SBI",
                ref: "$.payload.identifiers.sbi",
                type: "string",
              },
              clientReference: {
                label: "Client Reference",
                ref: "$.payload.clientRef",
                type: "string",
              },
              submittedAt: {
                label: "Submitted Date",
                ref: "$.payload.submittedAt",
                type: "date",
              },
            },
          },
          tabs: {
            caseDetails: {
              title: "Application",
              sections: [
                {
                  title: "Answers",
                  type: "list",
                  fields: [
                    {
                      ref: "$.payload.answers.scheme",
                      type: "string",
                      label: "Scheme",
                    },
                    {
                      ref: "$.payload.answers.year",
                      type: "number",
                      label: "Year",
                    },
                    {
                      ref: "$.payload.answers.hasCheckedLandIsUpToDate",
                      type: "boolean",
                      label: "Has checked land is up to date?",
                    },
                    {
                      ref: "$.payload.answers.agreementName",
                      type: "string",
                      label: "Agreement Name",
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    },
  };
};

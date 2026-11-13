import { describe, expect, it, vi } from "vitest";
import { createCaseListByTypeViewModel } from "./case-list-by-type.view-model.js";

vi.mock("../../common/view-models/header.view-model.js");

const mockRequest = {
  path: "/types/woodland/cases",
  url: new URL("http://localhost:3000/types/woodland/cases"),
  query: {},
};

const createMockPage = (cases) => ({
  data: {
    cases,
    pagination: {
      totalCount: cases.length,
    },
  },
  header: { navItems: [] },
});

const mockCases = [
  {
    _id: "case-1",
    caseRef: "CASE-REF-001",
    workflowCode: "woodland",
    schemeName: "Woodland Management Plan",
    createdAt: "2021-03-10T00:00:00.000Z",
    payload: {
      identifiers: { sbi: "123456789" },
      answers: {
        applicant: {
          business: { name: "[business name]" },
        },
      },
    },
    hasLinkedCases: false,
    currentStatus: "NEW",
    currentStatusTheme: "INFO",
    assignedUser: null,
  },
];

describe("createCaseListByTypeViewModel", () => {
  it("sets page title and heading to include the case type", () => {
    const result = createCaseListByTypeViewModel({
      page: createMockPage(mockCases),
      request: mockRequest,
      caseType: "woodland",
    });

    expect(result.pageTitle).toBe("Cases \u2013 woodland");
    expect(result.pageHeading).toBe("Cases \u2013 woodland");
  });

  it("sets the tab label to Cases – [caseType]", () => {
    const result = createCaseListByTypeViewModel({
      page: createMockPage(mockCases),
      request: mockRequest,
      caseType: "woodland",
    });

    expect(result.data.tabItems[0].label).toBe("Cases \u2013 woodland");
  });

  it("sets formAction to the case-type-scoped path", () => {
    const result = createCaseListByTypeViewModel({
      page: createMockPage(mockCases),
      request: mockRequest,
      caseType: "woodland",
    });

    expect(result.data.formAction).toBe("/types/woodland/cases");
  });

  it("does not set emptyMessage when there are cases", () => {
    const result = createCaseListByTypeViewModel({
      page: createMockPage(mockCases),
      request: mockRequest,
      caseType: "woodland",
    });

    expect(result.data.emptyMessage).toBeUndefined();
  });

  it("sets emptyMessage when there are no cases", () => {
    const result = createCaseListByTypeViewModel({
      page: createMockPage([]),
      request: mockRequest,
      caseType: "woodland",
    });

    expect(result.data.emptyMessage).toBe(
      "There are no cases for this case type",
    );
  });

  it("preserves table data from the base view model", () => {
    const result = createCaseListByTypeViewModel({
      page: createMockPage(mockCases),
      request: mockRequest,
      caseType: "woodland",
    });

    expect(result.data.tabItems[0].data.rows).toHaveLength(1);
    expect(result.data.tabItems[0].data.rows[0].caseType.text).toBe(
      "Woodland Management Plan",
    );
  });

  it("has empty breadcrumbs", () => {
    const result = createCaseListByTypeViewModel({
      page: createMockPage([]),
      request: mockRequest,
      caseType: "woodland",
    });

    expect(result.breadcrumbs).toEqual([]);
  });

  it("generates sort links using the current pathname", () => {
    const result = createCaseListByTypeViewModel({
      page: createMockPage([]),
      request: mockRequest,
      caseType: "woodland",
    });

    const caseTypeHeader = result.data.tabItems[0].data.head[2];
    expect(caseTypeHeader.html).toContain(
      'href="/types/woodland/cases?workflowCode=asc"',
    );
  });
});

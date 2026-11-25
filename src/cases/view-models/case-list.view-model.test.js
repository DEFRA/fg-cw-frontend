import { describe, expect, it, vi } from "vitest";
import {
  createAssignedUserSuccessMessage,
  createCaseListViewModel,
  mapCasesToTable,
  mapText,
} from "./case-list.view-model.js";

vi.mock("../../common/view-models/header.view-model.js");

const mockRequest = {
  path: "/cases",
  url: new URL("http://localhost:3000/cases"),
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

describe("case-list.model", () => {
  describe("mapText", () => {
    it("returns text when provided", () => {
      expect(mapText("hello world")).toBe("hello world");
    });

    it("returns empty string when text is null", () => {
      expect(mapText(null)).toBe("");
    });

    it("returns empty string when text is undefined", () => {
      expect(mapText(undefined)).toBe("");
    });

    it("returns empty string when text is empty string", () => {
      expect(mapText("")).toBe("");
    });

    it("returns default text when provided and text is falsy", () => {
      expect(mapText(null, "default")).toBe("default");
      expect(mapText(undefined, "default")).toBe("default");
      expect(mapText("", "default")).toBe("default");
    });

    it("returns original text when provided, ignoring default", () => {
      expect(mapText("actual", "default")).toBe("actual");
    });
  });

  describe("createAssignedUserSuccessMessage", () => {
    const mockTableRows = [
      {
        _id: "case-1",
        id: { text: "CLIENT-001", href: "/cases/case-1" },
        assignee: { text: "John Doe" },
      },
      {
        _id: "case-2",
        id: { text: "CLIENT-002", href: "/cases/case-2" },
        assignee: { text: "" },
      },
      {
        _id: "case-3",
        id: { text: "CLIENT-003", href: "/cases/case-3" },
        assignee: { text: "Example Assignee" },
      },
    ];

    it("returns null when assignedCaseId is not provided", () => {
      expect(createAssignedUserSuccessMessage(null, mockTableRows)).toBeNull();
      expect(
        createAssignedUserSuccessMessage(undefined, mockTableRows),
      ).toBeNull();
      expect(createAssignedUserSuccessMessage("", mockTableRows)).toBeNull();
    });

    it("returns null when case is not found", () => {
      expect(
        createAssignedUserSuccessMessage("non-existent", mockTableRows),
      ).toBeNull();
    });

    it("returns null when case has no assigned user", () => {
      expect(
        createAssignedUserSuccessMessage("case-2", mockTableRows),
      ).toBeNull();
    });

    it("returns success message when case has assigned user", () => {
      const result = createAssignedUserSuccessMessage("case-1", mockTableRows);

      expect(result).toEqual({
        heading: "Case assigned successfully",
        ref: "CLIENT-001",
        link: "/cases/case-1",
        assignedUserName: "John Doe",
      });
    });

    it("returns success message for different assigned case", () => {
      const result = createAssignedUserSuccessMessage("case-3", mockTableRows);

      expect(result).toEqual({
        heading: "Case assigned successfully",
        ref: "CLIENT-003",
        link: "/cases/case-3",
        assignedUserName: "Example Assignee",
      });
    });
  });

  describe("createCaseListViewModel", () => {
    const mockCases = [
      {
        _id: "case-1",
        caseRef: "CASE-REF-001",
        workflowCode: "wmp",
        schemeName: "wmp",
        createdAt: "2021-03-10T00:00:00.000Z",
        payload: {
          identifiers: {
            sbi: "123456789",
          },
          answers: {
            applicant: {
              business: {
                name: "[business name]",
              },
            },
          },
        },
        hasLinkedCases: true,
        currentStatus: "NEW",
        currentStatusTheme: "INFO",
        assignedUser: {
          id: "user-1",
          name: "John Doe",
        },
      },
      {
        _id: "case-2",
        caseRef: "CASE-REF-002",
        workflowCode: "frps-private-beta",
        schemeName: "frps-private-beta",
        createdAt: "2021-03-15T00:00:00.000Z",
        hasLinkedCases: false,
        payload: {
          identifiers: {
            sbi: "987654321",
          },
          answers: {
            applicant: {
              business: {
                name: "[business name]",
              },
            },
          },
        },
        currentStatus: "IN PROGRESS",
        currentStatusTheme: "INFO",
        assignedUser: null,
      },
    ];

    it("creates complete view model with tabItems structure", () => {
      const result = createCaseListViewModel({
        page: createMockPage(mockCases),
        request: mockRequest,
      });

      expect(result).toEqual({
        pageTitle: "Cases",
        pageHeading: "Cases",
        breadcrumbs: [],
        data: {
          tabItems: [
            {
              label: "All cases (2)",
              id: "all-cases",
              data: {
                head: [
                  { text: "Select" },
                  { html: expect.stringContaining("Linked cases") },
                  {
                    html: expect.stringContaining("Type"),
                    attributes: { "aria-sort": "none" },
                  },
                  {
                    html: expect.stringContaining("ID"),
                    attributes: { "aria-sort": "none" },
                  },
                  {
                    text: "Business",
                    attributes: { "aria-sort": "none" },
                  },
                  {
                    text: "SBI",
                    attributes: { "aria-sort": "none" },
                  },
                  {
                    html: expect.stringContaining("Submitted"),
                    attributes: { "aria-sort": "none" },
                  },
                  {
                    text: "Status",
                    attributes: { "aria-sort": "none" },
                  },
                  {
                    text: "Assignee",
                    attributes: { "aria-sort": "none" },
                  },
                ],
                rows: [
                  {
                    _id: "case-1",
                    select: { value: "case-1" },
                    id: {
                      href: "/cases/case-1",
                      text: "CASE-REF-001",
                    },
                    linked: {
                      html: expect.stringContaining("Linked case"),
                    },
                    caseType: { text: "wmp" },
                    business: { text: "[business name]" },
                    sbi: { text: "123456789" },
                    submitted: {
                      text: "10 Mar 2021",
                    },
                    status: {
                      text: "New",
                      theme: "INFO",
                    },
                    assignee: { text: "John Doe" },
                  },
                  {
                    _id: "case-2",
                    select: { value: "case-2" },
                    linked: {
                      html: expect.stringContaining("Case not linked"),
                    },
                    caseType: { text: "frps-private-beta" },
                    id: {
                      href: "/cases/case-2",
                      text: "CASE-REF-002",
                    },
                    business: { text: "[business name]" },
                    sbi: { text: "987654321" },
                    submitted: {
                      text: "15 Mar 2021",
                    },
                    status: {
                      text: "In progress",
                      theme: "INFO",
                    },
                    assignee: { text: "Not assigned" },
                  },
                ],
              },
              pagination: {
                items: [],
                classes: "govuk-!-margin-bottom-2",
              },
              searchValue: "",
            },
          ],
          assignedUserSuccessMessage: null,
          pagination: {
            items: [],
            classes: "govuk-!-margin-bottom-2",
          },
          searchValue: "",
        },
      });
    });

    it("creates view model with empty cases", () => {
      const result = createCaseListViewModel({
        page: createMockPage([]),
        request: mockRequest,
      });

      expect(result.data.tabItems[0].data.rows).toEqual([]);
      expect(result.data.tabItems[0].label).toBe("All cases (0)");
    });

    it("falls back to workflowCode when schemeName is missing", () => {
      const result = createCaseListViewModel({
        page: createMockPage([
          {
            ...mockCases[0],
            schemeName: undefined,
          },
        ]),
        request: mockRequest,
      });

      expect(result.data.tabItems[0].data.rows[0].caseType.text).toBe("wmp");
    });

    it("has consistent page title and page heading", () => {
      const result = createCaseListViewModel({
        page: createMockPage([]),
        request: mockRequest,
      });

      expect(result.pageTitle).toBe("Cases");
      expect(result.pageHeading).toBe("Cases");
    });

    it("has empty breadcrumbs array", () => {
      const result = createCaseListViewModel({
        page: createMockPage([]),
        request: mockRequest,
      });

      expect(result.breadcrumbs).toEqual([]);
    });

    it("includes assignedUserSuccessMessage when provided", () => {
      const result = createCaseListViewModel({
        page: createMockPage(mockCases),
        request: mockRequest,
        assignedCaseId: "case-1",
      });

      expect(result.data.assignedUserSuccessMessage).toEqual({
        heading: "Case assigned successfully",
        ref: "CASE-REF-001",
        link: "/cases/case-1",
        assignedUserName: "John Doe",
      });
    });
  });

  describe("status mapping", () => {
    it("maps NEW status with INFO theme", () => {
      const mockCases = [
        {
          _id: "case-1",
          clientRef: "REF-1",
          payload: {
            submittedAt: "2021-01-01T00:00:00.000Z",
          },
          currentStatus: "NEW",
          currentStatusTheme: "INFO",
          assignedUser: null,
        },
      ];

      const result = createCaseListViewModel({
        page: createMockPage(mockCases),
        request: mockRequest,
      });
      const statusCell = result.data.tabItems[0].data.rows[0].status;

      expect(statusCell).toEqual({
        text: "New",
        theme: "INFO",
      });
    });

    it("maps IN_PROGRESS status with INFO theme", () => {
      const mockCases = [
        {
          _id: "case-1",
          payload: {
            clientRef: "REF-1",
            submittedAt: "2021-01-01T00:00:00.000Z",
          },
          currentStatus: "IN PROGRESS",
          currentStatusTheme: "INFO",
          assignedUser: null,
        },
      ];

      const result = createCaseListViewModel({
        page: createMockPage(mockCases),
        request: mockRequest,
      });
      const statusCell = result.data.tabItems[0].data.rows[0].status;

      expect(statusCell).toEqual({
        text: "In progress",
        theme: "INFO",
      });
    });

    it("maps APPROVED status with SUCCESS theme", () => {
      const mockCases = [
        {
          _id: "case-1",
          payload: {
            clientRef: "REF-1",
            submittedAt: "2021-01-01T00:00:00.000Z",
          },
          currentStatus: "APPROVED",
          currentStatusTheme: "SUCCESS",
          assignedUser: null,
        },
      ];

      const result = createCaseListViewModel({
        page: createMockPage(mockCases),
        request: mockRequest,
      });
      const statusCell = result.data.tabItems[0].data.rows[0].status;

      expect(statusCell).toEqual({
        text: "Approved",
        theme: "SUCCESS",
      });
    });
  });

  it("handles null status", () => {
    const mockCases = [
      {
        _id: "case-1",
        payload: {
          clientRef: "REF-1",
          submittedAt: "2021-01-01T00:00:00.000Z",
        },
        currentStatus: null,
        currentStatusTheme: null,
        assignedUser: null,
      },
    ];

    const result = createCaseListViewModel({
      page: createMockPage(mockCases),
      request: mockRequest,
    });
    const statusCell = result.data.tabItems[0].data.rows[0].status;

    expect(statusCell).toEqual({
      text: "",
      theme: "",
    });
  });
});

describe("table structure mapping", () => {
  it("maps case data to correct table structure", () => {
    const mockCases = [
      {
        _id: "test-case-id",
        caseRef: "CASE-REF-123",
        workflowCode: "pmf",
        schemeName: "pmf",
        createdAt: "2021-06-15T14:30:00.000Z",
        payload: {
          submittedAt: "2021-06-15T14:30:00.000Z",
          identifiers: { sbi: "900000105" },
          answers: {
            applicant: {
              business: {
                name: "[business name]",
              },
            },
          },
        },
        hasLinkedCases: true,
        currentStatus: "NEW",
        currentStatusTheme: "INFO",
        assignedUser: { name: "Test User" },
      },
    ];

    const result = createCaseListViewModel({
      page: createMockPage(mockCases),
      request: mockRequest,
    });
    const tableData = result.data.tabItems[0].data;

    expect(tableData.head).toEqual([
      { text: "Select" },
      { html: expect.stringContaining("Linked cases") },
      {
        html: expect.stringContaining("Type"),
        attributes: {
          "aria-sort": "none",
        },
      },
      {
        html: expect.stringContaining("ID"),
        attributes: {
          "aria-sort": "none",
        },
      },
      {
        text: "Business",
        attributes: {
          "aria-sort": "none",
        },
      },
      {
        text: "SBI",
        attributes: {
          "aria-sort": "none",
        },
      },
      {
        html: expect.stringContaining("Submitted"),
        attributes: {
          "aria-sort": "none",
        },
      },
      {
        text: "Status",
        attributes: {
          "aria-sort": "none",
        },
      },
      {
        text: "Assignee",
        attributes: {
          "aria-sort": "none",
        },
      },
    ]);

    expect(tableData.rows[0]).toEqual({
      _id: "test-case-id",
      select: {
        value: "test-case-id",
      },
      id: {
        href: "/cases/test-case-id",
        text: "CASE-REF-123",
      },
      linked: {
        html: expect.stringContaining("Linked case"),
      },
      caseType: {
        text: "pmf",
      },
      business: { text: "[business name]" },
      sbi: { text: "900000105" },
      submitted: {
        text: "15 Jun 2021",
      },
      status: {
        text: "New",
        theme: "INFO",
      },
      assignee: { text: "Test User" },
    });
  });

  it("handles missing optional fields gracefully", () => {
    const mockCases = [
      {
        _id: "minimal-case",
        payload: {
          clientRef: null,
          submittedAt: null,
          identifiers: null,
        },
        currentStatus: "UNKNOWN",
        currentStatusTheme: null,
        assignedUser: null,
      },
    ];

    const result = createCaseListViewModel({
      page: createMockPage(mockCases),
      request: mockRequest,
    });
    const row = result.data.tabItems[0].data.rows[0];

    expect(row.caseType.text).toBe("");
    expect(row.id.text).toBe("");
    expect(row.sbi.text).toBe("");
    expect(row.submitted.text).toBe("");
    expect(row.status.text).toBe("Unknown");
    expect(row.assignee.text).toBe("Not assigned");
  });

  it("uses schemeName in the Type column when it is defined", () => {
    const mockCases = [
      {
        _id: "scheme-case",
        workflowCode: "grasslands",
        schemeName: "Grassland Private Beta",
        currentStatus: "NEW",
        assignedUser: null,
      },
    ];

    const result = createCaseListViewModel({
      page: createMockPage(mockCases),
      request: mockRequest,
    });
    const row = result.data.tabItems[0].data.rows[0];

    expect(row.caseType.text).toBe("Grassland Private Beta");
  });

  it("uses the workflow code supplied as schemeName by the backend", () => {
    const mockCases = [
      {
        _id: "no-scheme-case",
        schemeName: "grasslands",
        currentStatus: "NEW",
        assignedUser: null,
      },
    ];

    const result = createCaseListViewModel({
      page: createMockPage(mockCases),
      request: mockRequest,
    });
    const row = result.data.tabItems[0].data.rows[0];

    expect(row.caseType.text).toBe("grasslands");
  });
});

describe("sortable headers", () => {
  it("appends the fragment to every sort link when one is given", () => {
    const { head } = mapCasesToTable(
      [],
      new URL("http://localhost:3000/cases?caseRef=asc"),
      { fragment: "#my-cases" },
    );

    expect(head[2].html).toContain('href="/cases?workflowCode=asc#my-cases"');
    expect(head[3].html).toContain('href="/cases?caseRef=desc#my-cases"');
    expect(head[6].html).toContain('href="/cases?createdAt=asc#my-cases"');
  });

  it("adds no fragment to sort links by default", () => {
    const { head } = mapCasesToTable(
      [],
      new URL("http://localhost:3000/cases"),
    );

    expect(head[2].html).toContain('href="/cases?workflowCode=asc"');
    expect(head[3].html).toContain('href="/cases?caseRef=asc"');
    expect(head[6].html).toContain('href="/cases?createdAt=asc"');
  });

  it("links to ?workflowCode=asc when no sort is active", () => {
    const result = createCaseListViewModel({
      page: createMockPage([]),
      request: mockRequest,
    });
    const caseTypeHeader = result.data.tabItems[0].data.head[2];

    expect(caseTypeHeader.html).toContain('href="/cases?workflowCode=asc"');
    expect(caseTypeHeader.attributes["aria-sort"]).toBe("none");
  });

  it("shows ascending state and links to ?workflowCode=desc when ?workflowCode=asc is in URL", () => {
    const request = {
      path: "/cases",
      url: new URL("http://localhost:3000/cases?workflowCode=asc"),
      query: {},
    };

    const result = createCaseListViewModel({
      page: createMockPage([]),
      request,
    });
    const caseTypeHeader = result.data.tabItems[0].data.head[2];

    expect(caseTypeHeader.html).toContain('href="/cases?workflowCode=desc"');
    expect(caseTypeHeader.attributes["aria-sort"]).toBe("ascending");
  });

  it("shows descending state and links to ?workflowCode=asc when ?workflowCode=desc is in URL", () => {
    const request = {
      path: "/cases",
      url: new URL("http://localhost:3000/cases?workflowCode=desc"),
      query: {},
    };

    const result = createCaseListViewModel({
      page: createMockPage([]),
      request,
    });
    const caseTypeHeader = result.data.tabItems[0].data.head[2];

    expect(caseTypeHeader.html).toContain('href="/cases?workflowCode=asc"');
    expect(caseTypeHeader.attributes["aria-sort"]).toBe("descending");
  });

  it("links to ?caseRef=asc when no sort is active", () => {
    const result = createCaseListViewModel({
      page: createMockPage([]),
      request: mockRequest,
    });
    const idHeader = result.data.tabItems[0].data.head[3];

    expect(idHeader.html).toContain('href="/cases?caseRef=asc"');
    expect(idHeader.attributes["aria-sort"]).toBe("none");
  });

  it("shows ascending state and links to ?caseRef=desc when ?caseRef=asc is in URL", () => {
    const request = {
      path: "/cases",
      url: new URL("http://localhost:3000/cases?caseRef=asc"),
      query: {},
    };

    const result = createCaseListViewModel({
      page: createMockPage([]),
      request,
    });
    const idHeader = result.data.tabItems[0].data.head[3];

    expect(idHeader.html).toContain('href="/cases?caseRef=desc"');
    expect(idHeader.attributes["aria-sort"]).toBe("ascending");
  });

  it("shows descending state and links to ?caseRef=asc when ?caseRef=desc is in URL", () => {
    const request = {
      path: "/cases",
      url: new URL("http://localhost:3000/cases?caseRef=desc"),
      query: {},
    };

    const result = createCaseListViewModel({
      page: createMockPage([]),
      request,
    });
    const idHeader = result.data.tabItems[0].data.head[3];

    expect(idHeader.html).toContain('href="/cases?caseRef=asc"');
    expect(idHeader.attributes["aria-sort"]).toBe("descending");
  });

  it("shows ascending state for Submitted header when ?createdAt=asc is in URL", () => {
    const request = {
      path: "/cases",
      url: new URL("http://localhost:3000/cases?createdAt=asc"),
      query: {},
    };

    const result = createCaseListViewModel({
      page: createMockPage([]),
      request,
    });
    const submittedHeader = result.data.tabItems[0].data.head[6];

    expect(submittedHeader.html).toContain('href="/cases?createdAt=desc"');
    expect(submittedHeader.attributes["aria-sort"]).toBe("ascending");
  });
});

describe("pagination", () => {
  const createMockPageWithPagination = (paginationData) => ({
    data: {
      cases: [],
      pagination: {
        totalCount: 0,
        ...paginationData,
      },
    },
    header: { navItems: [] },
  });

  it("has no previous or next links when neither hasPreviousPage nor hasNextPage", () => {
    const result = createCaseListViewModel({
      page: createMockPageWithPagination({
        hasPreviousPage: false,
        hasNextPage: false,
      }),
      request: mockRequest,
    });

    expect(result.data.pagination.previous).toBeUndefined();
    expect(result.data.pagination.next).toBeUndefined();
  });

  it("has previous link when hasPreviousPage is true", () => {
    const result = createCaseListViewModel({
      page: createMockPageWithPagination({
        hasPreviousPage: true,
        hasNextPage: false,
        startCursor: "cursor-abc",
      }),
      request: mockRequest,
    });

    expect(result.data.pagination.previous.href).toBe(
      "/cases?cursor=cursor-abc&direction=backward",
    );
    expect(result.data.pagination.next).toBeUndefined();
  });

  it("has next link when hasNextPage is true", () => {
    const result = createCaseListViewModel({
      page: createMockPageWithPagination({
        hasPreviousPage: false,
        hasNextPage: true,
        endCursor: "cursor-xyz",
      }),
      request: mockRequest,
    });

    expect(result.data.pagination.next.href).toBe(
      "/cases?cursor=cursor-xyz&direction=forward",
    );
    expect(result.data.pagination.previous).toBeUndefined();
  });

  it("has both previous and next links when both flags are true", () => {
    const result = createCaseListViewModel({
      page: createMockPageWithPagination({
        hasPreviousPage: true,
        hasNextPage: true,
        startCursor: "cursor-prev",
        endCursor: "cursor-next",
      }),
      request: mockRequest,
    });

    expect(result.data.pagination.previous.href).toBe(
      "/cases?cursor=cursor-prev&direction=backward",
    );
    expect(result.data.pagination.next.href).toBe(
      "/cases?cursor=cursor-next&direction=forward",
    );
  });

  it("preserves existing search params in pagination links", () => {
    const request = {
      path: "/cases",
      url: new URL("http://localhost:3000/cases?caseRef=asc"),
      query: {},
    };

    const result = createCaseListViewModel({
      page: createMockPageWithPagination({
        hasPreviousPage: true,
        hasNextPage: true,
        startCursor: "cursor-prev",
        endCursor: "cursor-next",
      }),
      request,
    });

    expect(result.data.pagination.previous.href).toBe(
      "/cases?caseRef=asc&cursor=cursor-prev&direction=backward",
    );
    expect(result.data.pagination.next.href).toBe(
      "/cases?caseRef=asc&cursor=cursor-next&direction=forward",
    );
  });
});

describe("search functionality", () => {
  it("includes searchValue in data when search query param is provided", () => {
    const request = {
      path: "/cases",
      url: new URL("http://localhost:3000/cases?search=12345"),
      query: { search: "12345" },
    };

    const result = createCaseListViewModel({
      page: createMockPage([]),
      request,
    });

    expect(result.data.searchValue).toBe("12345");
  });

  it("includes searchValue in tabItems when search query param is provided", () => {
    const request = {
      path: "/cases",
      url: new URL("http://localhost:3000/cases?search=SBI123"),
      query: { search: "SBI123" },
    };

    const result = createCaseListViewModel({
      page: createMockPage([]),
      request,
    });

    expect(result.data.tabItems[0].searchValue).toBe("SBI123");
  });

  it("sets searchValue to empty string when no search query param", () => {
    const result = createCaseListViewModel({
      page: createMockPage([]),
      request: mockRequest,
    });

    expect(result.data.searchValue).toBe("");
  });

  it("sets searchValue to empty string when search query param is empty", () => {
    const request = {
      path: "/cases",
      url: new URL("http://localhost:3000/cases?search="),
      query: { search: "" },
    };

    const result = createCaseListViewModel({
      page: createMockPage([]),
      request,
    });

    expect(result.data.searchValue).toBe("");
  });
});

describe("my cases tab", () => {
  const myCase = {
    _id: "my-case-1",
    caseRef: "MY-CASE-001",
    workflowCode: "woodland",
    schemeName: "Woodland",
    createdAt: "2026-11-01T00:00:00.000Z",
    currentStatus: "NEW",
    currentStatusTheme: "INFO",
    hasLinkedCases: false,
    assignedUser: { id: "60c72b2f9b1e8d001c8e4f5a", name: "Casey Test" },
  };

  const pageWith = (cases, pagination = {}) => ({
    data: {
      cases,
      pagination: { totalCount: cases.length, ...pagination },
    },
    header: { navItems: [] },
  });

  const myCasesTabOf = (result) =>
    result.data.tabItems.find(({ id }) => id === "my-cases");

  it("is not added when no my cases page is given", () => {
    const result = createCaseListViewModel({
      page: pageWith([]),
      request: mockRequest,
    });

    expect(result.data.tabItems.map(({ id }) => id)).toEqual(["all-cases"]);
  });

  it("follows the All cases tab, labelled without a count", () => {
    const result = createCaseListViewModel({
      page: pageWith([]),
      myCasesPage: pageWith([myCase]),
      request: mockRequest,
    });

    expect(
      result.data.tabItems.map(({ id, label }) => ({ id, label })),
    ).toEqual([
      { id: "all-cases", label: "All cases (0)" },
      { id: "my-cases", label: "My cases" },
    ]);
  });

  it("shows the user's cases with the same columns as All cases", () => {
    const result = createCaseListViewModel({
      page: pageWith([myCase]),
      myCasesPage: pageWith([myCase]),
      request: mockRequest,
    });
    const [allCases, myCases] = result.data.tabItems;

    expect(myCases.data.rows).toEqual(allCases.data.rows);
    expect(myCases.data.rows[0].caseType.text).toBe("Woodland");
    expect(myCases.data.rows[0].id.href).toBe("/cases/my-case-1");
    expect(myCases.data.head.map((h) => h.text ?? h.attributes)).toEqual(
      allCases.data.head.map((h) => h.text ?? h.attributes),
    );
  });

  it("keeps the user on the tab when sorting", () => {
    const result = createCaseListViewModel({
      page: pageWith([]),
      myCasesPage: pageWith([]),
      request: mockRequest,
    });

    expect(myCasesTabOf(result).data.head[3].html).toContain(
      'href="/cases?caseRef=asc#my-cases"',
    );
  });

  it("pages with myCursor and myDirection, keeping the All cases cursor", () => {
    const request = {
      path: "/cases",
      url: new URL(
        "http://localhost:3000/cases?cursor=all-1&direction=forward",
      ),
      query: { cursor: "all-1", direction: "forward" },
    };

    const result = createCaseListViewModel({
      page: pageWith([]),
      myCasesPage: pageWith([], {
        hasPreviousPage: true,
        hasNextPage: true,
        startCursor: "my-start",
        endCursor: "my-end",
      }),
      request,
    });
    const { pagination } = myCasesTabOf(result);

    expect(pagination.previous.href).toBe(
      "/cases?cursor=all-1&direction=forward&myCursor=my-start&myDirection=backward#my-cases",
    );
    expect(pagination.next.href).toBe(
      "/cases?cursor=all-1&direction=forward&myCursor=my-end&myDirection=forward#my-cases",
    );
  });

  it("leaves All cases paging untouched by My cases paging", () => {
    const request = {
      path: "/cases",
      url: new URL(
        "http://localhost:3000/cases?myCursor=my-1&myDirection=forward",
      ),
      query: { myCursor: "my-1", myDirection: "forward" },
    };

    const result = createCaseListViewModel({
      page: pageWith([], { hasNextPage: true, endCursor: "all-end" }),
      myCasesPage: pageWith([]),
      request,
    });
    const [allCases] = result.data.tabItems;

    expect(allCases.pagination.next.href).toBe(
      "/cases?myCursor=my-1&myDirection=forward&cursor=all-end&direction=forward",
    );
    expect(result.data.pagination).toEqual(allCases.pagination);
  });

  it("has no paging links when there is only one page", () => {
    const result = createCaseListViewModel({
      page: pageWith([]),
      myCasesPage: pageWith([myCase]),
      request: mockRequest,
    });
    const { pagination } = myCasesTabOf(result);

    expect(pagination.previous).toBeUndefined();
    expect(pagination.next).toBeUndefined();
  });

  it("has the search value", () => {
    const request = {
      path: "/cases",
      url: new URL("http://localhost:3000/cases?search=CASE-1"),
      query: { search: "CASE-1" },
    };

    const result = createCaseListViewModel({
      page: pageWith([]),
      myCasesPage: pageWith([]),
      request,
    });

    expect(myCasesTabOf(result).searchValue).toBe("CASE-1");
    expect(myCasesTabOf(result).data.rows).toEqual([]);
  });
});

describe("empty state", () => {
  const aCase = {
    _id: "case-1",
    caseRef: "CASE-001",
    workflowCode: "woodland",
    schemeName: "Woodland",
    createdAt: "2026-11-01T00:00:00.000Z",
    currentStatus: "NEW",
    currentStatusTheme: "INFO",
    hasLinkedCases: false,
    assignedUser: { id: "60c72b2f9b1e8d001c8e4f5a", name: "Casey Test" },
  };

  const pageWith = (cases, totalCount = cases.length) => ({
    data: { cases, pagination: { totalCount } },
    header: { navItems: [] },
  });

  const requestFor = (query = "") => {
    const url = new URL(`http://localhost:3000/cases${query}`);

    return {
      path: "/cases",
      url,
      query: Object.fromEntries(url.searchParams),
    };
  };

  const tabsOf = ({ page, myCasesPage, request = requestFor() }) => {
    const [allCases, myCases] = createCaseListViewModel({
      page,
      myCasesPage,
      request,
    }).data.tabItems;

    return { allCases, myCases };
  };

  it("is not set on a tab that has cases", () => {
    const { allCases, myCases } = tabsOf({
      page: pageWith([aCase]),
      myCasesPage: pageWith([aCase]),
    });

    expect(allCases.emptyState).toBeUndefined();
    expect(myCases.emptyState).toBeUndefined();
  });

  it("tells the user there are no assigned cases when My cases is empty", () => {
    const { myCases } = tabsOf({
      page: pageWith([aCase]),
      myCasesPage: pageWith([], 0),
      request: requestFor("?myCursor=my-1&myDirection=backward"),
    });

    expect(myCases.emptyState).toEqual({
      message: "There are no cases assigned to you",
    });
  });

  it("tells the user there are no cases when All cases is empty", () => {
    const { allCases } = tabsOf({ page: pageWith([], 0) });

    expect(allCases.emptyState).toEqual({ message: "There are no cases" });
  });

  it("links My cases back to its first page when its cursor is out of date", () => {
    const { myCases } = tabsOf({
      page: pageWith([aCase]),
      myCasesPage: pageWith([], 4),
      request: requestFor("?myCursor=my-1&myDirection=backward"),
    });

    expect(myCases.emptyState).toEqual({
      message: "There are no cases on this page",
      firstPageHref: "/cases#my-cases",
    });
  });

  it("links All cases back to its first page when its cursor is out of date", () => {
    const { allCases } = tabsOf({
      page: pageWith([], 4),
      request: requestFor("?cursor=all-1&direction=backward"),
    });

    expect(allCases.emptyState).toEqual({
      message: "There are no cases on this page",
      firstPageHref: "/cases",
    });
  });

  it("keeps the search, sort and the other tab's cursor in the first page link", () => {
    const { allCases, myCases } = tabsOf({
      page: pageWith([], 4),
      myCasesPage: pageWith([], 2),
      request: requestFor(
        "?search=CASE&caseRef=asc&cursor=all-1&direction=backward&myCursor=my-1&myDirection=backward",
      ),
    });

    expect(allCases.emptyState.firstPageHref).toBe(
      "/cases?search=CASE&caseRef=asc&myCursor=my-1&myDirection=backward",
    );
    expect(myCases.emptyState.firstPageHref).toBe(
      "/cases?search=CASE&caseRef=asc&cursor=all-1&direction=backward#my-cases",
    );
  });

  it("tells the user nothing matches when a search has no results", () => {
    const { allCases, myCases } = tabsOf({
      page: pageWith([], 0),
      myCasesPage: pageWith([], 0),
      request: requestFor("?search=NOPE"),
    });

    const noMatches = {
      message: "There are no cases matching your search criteria",
    };
    expect(allCases.emptyState).toEqual(noMatches);
    expect(myCases.emptyState).toEqual(noMatches);
  });

  it("treats a search with matches but an out-of-date cursor as an empty page", () => {
    const { allCases } = tabsOf({
      page: pageWith([], 3),
      request: requestFor("?search=CASE&cursor=all-1&direction=backward"),
    });

    expect(allCases.emptyState).toEqual({
      message: "There are no cases on this page",
      firstPageHref: "/cases?search=CASE",
    });
  });
});

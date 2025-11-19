import { describe, expect, it } from "vitest";
import {
  createAssignedUserSuccessMessage,
  createCaseListViewModel,
  mapText,
} from "./case-list.view-model.js";

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
        assignee: { text: "Jane Smith" },
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
        assignedUserName: "Jane Smith",
      });
    });
  });

  describe("createCaseListViewModel", () => {
    const mockCases = [
      {
        _id: "case-1",
        caseRef: "CASE-REF-001",
        payload: {
          submittedAt: "2021-03-10T00:00:00.000Z",
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
        currentStatus: "NEW",
        assignedUser: {
          id: "user-1",
          name: "John Doe",
        },
      },
      {
        _id: "case-2",
        caseRef: "CASE-REF-002",
        payload: {
          submittedAt: "2021-03-15T00:00:00.000Z",
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
        assignedUser: null,
      },
    ];

    it("creates complete view model with tabItems structure", () => {
      const result = createCaseListViewModel(mockCases);

      expect(result).toEqual({
        pageTitle: "Cases",
        pageHeading: "Cases",
        breadcrumbs: [],
        data: {
          tabItems: [
            {
              label: "SFI applications (2)",
              id: "all-cases",
              data: {
                head: [
                  { text: "Select" },
                  { text: "ID" },
                  { text: "Business" },
                  { text: "SBI" },
                  { text: "Submitted" },
                  { text: "Status" },
                  { text: "Assignee" },
                ],
                rows: [
                  {
                    _id: "case-1",
                    select: { value: "case-1" },
                    id: { href: "/cases/case-1", text: "CASE-REF-001" },
                    business: { text: "[business name]" },
                    sbi: { text: "123456789" },
                    submitted: { text: "10 Mar 2021" },
                    status: { text: "New", classes: "govuk-tag--blue" },
                    assignee: { text: "John Doe" },
                  },
                  {
                    _id: "case-2",
                    select: { value: "case-2" },
                    id: { href: "/cases/case-2", text: "CASE-REF-002" },
                    business: { text: "[business name]" },
                    sbi: { text: "987654321" },
                    submitted: { text: "15 Mar 2021" },
                    status: {
                      text: "In progress",
                      classes: "govuk-tag--yellow",
                    },
                    assignee: { text: "Not assigned" },
                  },
                ],
              },
            },
          ],
          assignedUserSuccessMessage: null,
        },
      });
    });

    it("creates view model with empty cases", () => {
      const result = createCaseListViewModel([]);

      expect(result.data.tabItems[0].data.rows).toEqual([]);
      expect(result.data.tabItems[0].label).toBe("SFI applications (0)");
    });

    it("has consistent page title and page heading", () => {
      const result = createCaseListViewModel([]);

      expect(result.pageTitle).toBe("Cases");
      expect(result.pageHeading).toBe("Cases");
    });

    it("has empty breadcrumbs array", () => {
      const result = createCaseListViewModel([]);

      expect(result.breadcrumbs).toEqual([]);
    });

    it("includes assignedUserSuccessMessage when provided", () => {
      const result = createCaseListViewModel(mockCases, "case-1");

      expect(result.data.assignedUserSuccessMessage).toEqual({
        heading: "Case assigned successfully",
        ref: "CASE-REF-001",
        link: "/cases/case-1",
        assignedUserName: "John Doe",
      });
    });
  });

  describe("status mapping", () => {
    it("maps NEW status to blue tag", () => {
      const mockCases = [
        {
          _id: "case-1",
          clientRef: "REF-1",
          payload: {
            submittedAt: "2021-01-01T00:00:00.000Z",
          },
          currentStatus: "NEW",
          assignedUser: null,
        },
      ];

      const result = createCaseListViewModel(mockCases);
      const statusCell = result.data.tabItems[0].data.rows[0].status;

      expect(statusCell).toEqual({
        text: "New",
        classes: "govuk-tag--blue",
      });
    });

    it("maps IN_PROGRESS status to yellow tag", () => {
      const mockCases = [
        {
          _id: "case-1",
          payload: {
            clientRef: "REF-1",
            submittedAt: "2021-01-01T00:00:00.000Z",
          },
          currentStatus: "IN PROGRESS",
          assignedUser: null,
        },
      ];

      const result = createCaseListViewModel(mockCases);
      const statusCell = result.data.tabItems[0].data.rows[0].status;

      expect(statusCell).toEqual({
        text: "In progress",
        classes: "govuk-tag--yellow",
      });
    });

    it("maps APPROVED status to green tag", () => {
      const mockCases = [
        {
          _id: "case-1",
          payload: {
            clientRef: "REF-1",
            submittedAt: "2021-01-01T00:00:00.000Z",
          },
          currentStatus: "APPROVED",
          assignedUser: null,
        },
      ];

      const result = createCaseListViewModel(mockCases);
      const statusCell = result.data.tabItems[0].data.rows[0].status;

      expect(statusCell).toEqual({
        text: "Approved",
        classes: "govuk-tag--green",
      });
    });

    it("maps unknown status to grey tag", () => {
      const mockCases = [
        {
          _id: "case-1",
          payload: {
            clientRef: "REF-1",
            submittedAt: "2021-01-01T00:00:00.000Z",
          },
          currentStatus: "UNKNOWN_STATUS",
          assignedUser: null,
        },
      ];

      const result = createCaseListViewModel(mockCases);
      const statusCell = result.data.tabItems[0].data.rows[0].status;

      expect(statusCell).toEqual({
        text: "Unknown_status",
        classes: "govuk-tag--grey",
      });
    });

    it("handles null status gracefully", () => {
      const mockCases = [
        {
          _id: "case-1",
          payload: {
            clientRef: "REF-1",
            submittedAt: "2021-01-01T00:00:00.000Z",
          },
          currentStatus: null,
          assignedUser: null,
        },
      ];

      const result = createCaseListViewModel(mockCases);
      const statusCell = result.data.tabItems[0].data.rows[0].status;

      expect(statusCell).toEqual({
        text: "",
        classes: "govuk-tag--grey",
      });
    });
  });

  describe("table structure mapping", () => {
    it("maps case data to correct table structure", () => {
      const mockCases = [
        {
          _id: "test-case-id",
          caseRef: "CASE-REF-123",
          payload: {
            submittedAt: "2021-06-15T14:30:00.000Z",
            identifiers: { sbi: "555666777" },
            answers: {
              applicant: {
                business: {
                  name: "[business name]",
                },
              },
            },
          },
          currentStatus: "NEW",
          assignedUser: { name: "Test User" },
        },
      ];

      const result = createCaseListViewModel(mockCases);
      const tableData = result.data.tabItems[0].data;

      expect(tableData.head).toEqual([
        { text: "Select" },
        { text: "ID" },
        { text: "Business" },
        { text: "SBI" },
        { text: "Submitted" },
        { text: "Status" },
        { text: "Assignee" },
      ]);

      expect(tableData.rows[0]).toEqual({
        _id: "test-case-id",
        select: { value: "test-case-id" },
        id: { href: "/cases/test-case-id", text: "CASE-REF-123" },
        business: { text: "[business name]" },
        sbi: { text: "555666777" },
        submitted: { text: "15 Jun 2021" },
        status: { text: "New", classes: "govuk-tag--blue" },
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
          assignedUser: null,
        },
      ];

      const result = createCaseListViewModel(mockCases);
      const row = result.data.tabItems[0].data.rows[0];

      expect(row.id.text).toBe("");
      expect(row.sbi.text).toBe("");
      expect(row.submitted.text).toBe("");
      expect(row.status.text).toBe("Unknown");
      expect(row.assignee.text).toBe("Not assigned");
    });
  });
});

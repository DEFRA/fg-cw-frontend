import { describe, expect, it, vi } from "vitest";
import { getFormattedGBDate } from "../../common/helpers/date-helpers.js";
import {
  createCaseListViewModel,
  transformCasesForList,
} from "./case-list.view-model.js";

vi.mock("../../common/helpers/date-helpers.js");

describe("case-list.model", () => {
  describe("transformCasesForList", () => {
    it("transforms multiple cases correctly", () => {
      const mockCases = [
        {
          _id: "case-1",
          payload: {
            clientRef: "CLIENT-001",
            code: "CODE-001",
            submittedAt: "2021-01-15T00:00:00.000Z",
          },
          status: "In Progress",
          assignedUser: {
            id: "user-1",
            name: "john doe",
          },
        },
        {
          _id: "case-2",
          payload: {
            clientRef: "CLIENT-002",
            code: "CODE-002",
            submittedAt: "2021-02-20T00:00:00.000Z",
          },
          status: "Completed",
          assignedUser: {
            id: "user-2",
            name: "jane smith",
          },
        },
      ];

      getFormattedGBDate
        .mockReturnValueOnce("15/01/2021")
        .mockReturnValueOnce("20/02/2021");

      const result = transformCasesForList(mockCases);

      expect(result).toEqual([
        {
          _id: "case-1",
          clientRef: "CLIENT-001",
          code: "CODE-001",
          submittedAt: "15/01/2021",
          status: "In Progress",
          assignedUser: "john doe",
          link: "/cases/case-1",
        },
        {
          _id: "case-2",
          clientRef: "CLIENT-002",
          code: "CODE-002",
          submittedAt: "20/02/2021",
          status: "Completed",
          assignedUser: "jane smith",
          link: "/cases/case-2",
        },
      ]);

      expect(getFormattedGBDate).toHaveBeenCalledWith(
        "2021-01-15T00:00:00.000Z",
      );
      expect(getFormattedGBDate).toHaveBeenCalledWith(
        "2021-02-20T00:00:00.000Z",
      );
      expect(getFormattedGBDate).toHaveBeenCalledTimes(2);
    });

    it("transforms empty cases array", () => {
      const mockCases = [];

      const result = transformCasesForList(mockCases);

      expect(result).toEqual([]);

      expect(getFormattedGBDate).not.toHaveBeenCalled();
    });

    it("transforms single case correctly", () => {
      const mockCases = [
        {
          _id: "case-single",
          payload: {
            clientRef: "SINGLE-001",
            code: "SINGLE-CODE",
            submittedAt: null,
          },
          status: "Draft",
          assignedUser: null,
        },
      ];

      getFormattedGBDate.mockReturnValue("Not submitted");

      const result = transformCasesForList(mockCases);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        _id: "case-single",
        clientRef: "SINGLE-001",
        code: "SINGLE-CODE",
        submittedAt: "Not submitted",
        status: "Draft",
        assignedUser: undefined,
        link: "/cases/case-single",
      });

      expect(getFormattedGBDate).toHaveBeenCalledWith(null);
    });

    it("generates correct case links", () => {
      const mockCases = [
        {
          _id: "case-link-1",
          payload: {
            clientRef: "LINK-001",
            code: "LINK-CODE-1",
            submittedAt: "2021-01-01T00:00:00.000Z",
          },
          status: "Active",
          assignedUser: {
            id: "user-1",
            name: "user1",
          },
        },
        {
          _id: "case-link-2",
          payload: {
            clientRef: "LINK-002",
            code: "LINK-CODE-2",
            submittedAt: "2021-01-02T00:00:00.000Z",
          },
          status: "Active",
          assignedUser: {
            id: "user-2",
            name: "user2",
          },
        },
      ];

      getFormattedGBDate
        .mockReturnValueOnce("01/01/2021")
        .mockReturnValueOnce("02/01/2021");

      const result = transformCasesForList(mockCases);

      expect(result[0].link).toBe("/cases/case-link-1");
      expect(result[1].link).toBe("/cases/case-link-2");
    });
  });

  describe("createCaseListViewModel", () => {
    it("creates complete view model with cases", () => {
      const mockCases = [
        {
          _id: "case-vm-1",
          payload: {
            clientRef: "VM-001",
            code: "VM-CODE-1",
            submittedAt: "2021-03-10T00:00:00.000Z",
          },
          status: "Review",
          assignedUser: {
            id: "user-reviewer1",
            name: "reviewer1",
          },
        },
        {
          _id: "case-vm-2",
          payload: {
            clientRef: "VM-002",
            code: "VM-CODE-2",
            submittedAt: "2021-03-15T00:00:00.000Z",
          },
          status: "Approved",
          assignedUser: {
            id: "user-approver1",
            name: "approver1",
          },
        },
      ];

      getFormattedGBDate
        .mockReturnValueOnce("10/03/2021")
        .mockReturnValueOnce("15/03/2021");

      const result = createCaseListViewModel(mockCases);

      expect(result).toEqual({
        pageTitle: "Cases",
        pageHeading: "Cases",
        breadcrumbs: [],
        data: {
          allCases: [
            {
              _id: "case-vm-1",
              clientRef: "VM-001",
              code: "VM-CODE-1",
              submittedAt: "10/03/2021",
              status: "Review",
              assignedUser: "reviewer1",
              link: "/cases/case-vm-1",
            },
            {
              _id: "case-vm-2",
              clientRef: "VM-002",
              code: "VM-CODE-2",
              submittedAt: "15/03/2021",
              status: "Approved",
              assignedUser: "approver1",
              link: "/cases/case-vm-2",
            },
          ],
          assignedUserSuccessMessage: null,
        },
      });
    });

    it("creates view model with empty cases", () => {
      const mockCases = [];

      const result = createCaseListViewModel(mockCases);

      expect(result).toEqual({
        pageTitle: "Cases",
        pageHeading: "Cases",
        breadcrumbs: [],
        data: {
          allCases: [],
          assignedUserSuccessMessage: null,
        },
      });

      expect(getFormattedGBDate).not.toHaveBeenCalled();
    });

    it("creates view model with single case", () => {
      const mockCases = [
        {
          _id: "case-single-vm",
          payload: {
            clientRef: "SINGLE-VM-001",
            code: "SINGLE-VM-CODE",
            submittedAt: "2021-04-25T00:00:00.000Z",
          },
          status: "Pending",
          assignedUser: {
            id: "user-pending",
            name: "pending user",
          },
        },
      ];

      getFormattedGBDate.mockReturnValue("25/04/2021");

      const result = createCaseListViewModel(mockCases);

      expect(result.data.allCases).toHaveLength(1);
      expect(result.data.allCases[0].clientRef).toBe("SINGLE-VM-001");
      expect(result.pageTitle).toBe("Cases");
      expect(result.pageHeading).toBe("Cases");
    });

    it("has consistent page title and page heading", () => {
      const mockCases = [];

      const result = createCaseListViewModel(mockCases);

      expect(result.pageTitle).toBe("Cases");
      expect(result.pageHeading).toBe("Cases");
      expect(result.pageTitle).toBe(result.pageHeading);
    });

    it("has empty breadcrumbs array", () => {
      const mockCases = [];

      const result = createCaseListViewModel(mockCases);

      expect(result.breadcrumbs).toEqual([]);
      expect(Array.isArray(result.breadcrumbs)).toBe(true);
    });

    it("calls transformCasesForList internally", () => {
      const mockCases = [
        {
          _id: "case-transform",
          payload: {
            clientRef: "TRANSFORM-001",
            code: "TRANSFORM-CODE",
            submittedAt: "2021-05-01T00:00:00.000Z",
          },
          status: "Processing",
          assignedUser: {
            id: "user-processor",
            name: "processor",
          },
        },
      ];

      getFormattedGBDate.mockReturnValue("01/05/2021");

      const result = createCaseListViewModel(mockCases);

      // Verify the transformation happened by checking the structure
      expect(result.data).toHaveProperty("allCases");
      expect(result.data.allCases[0]).toHaveProperty("link");
      expect(result.data.allCases[0].link).toBe("/cases/case-transform");
    });
  });

  describe("transformCasesForList - assignedUser handling", () => {
    it("extracts assignedUser name from user object", () => {
      const mockCases = [
        {
          _id: "case-user-object",
          payload: {
            clientRef: "USER-OBJECT-001",
            code: "USER-OBJECT-CODE",
            submittedAt: "2021-01-01T00:00:00.000Z",
          },
          status: "Active",
          assignedUser: {
            id: "user-123",
            name: "John Doe",
          },
        },
      ];

      const result = transformCasesForList(mockCases);

      expect(result[0].assignedUser).toBe("John Doe");
      expect(result[0]._id).toBe("case-user-object");
    });

    it("handles null assignedUser", () => {
      const mockCases = [
        {
          _id: "case-null-user",
          payload: {
            clientRef: "NULL-USER-001",
            code: "NULL-USER-CODE",
            submittedAt: "2021-01-01T00:00:00.000Z",
          },
          status: "Unassigned",
          assignedUser: null,
        },
      ];

      const result = transformCasesForList(mockCases);

      expect(result[0].assignedUser).toBeUndefined();
      expect(result[0]._id).toBe("case-null-user");
    });

    it("handles undefined assignedUser", () => {
      const mockCases = [
        {
          _id: "case-undefined-user",
          payload: {
            clientRef: "UNDEFINED-USER-001",
            code: "UNDEFINED-USER-CODE",
            submittedAt: "2021-01-01T00:00:00.000Z",
          },
          status: "Unassigned",
          assignedUser: undefined,
        },
      ];

      const result = transformCasesForList(mockCases);

      expect(result[0].assignedUser).toBeUndefined();
      expect(result[0]._id).toBe("case-undefined-user");
    });
  });

  describe("createCaseListViewModel - assignedUserSuccessMessage", () => {
    it("returns null success message when assignedCaseId is undefined", () => {
      const result = createCaseListViewModel(mockCasesWithUsers, undefined);

      expect(result.data.assignedUserSuccessMessage).toBeNull();
    });

    it("returns null success message when assignedCaseId is empty string", () => {
      const result = createCaseListViewModel(mockCasesWithUsers, "");

      expect(result.data.assignedUserSuccessMessage).toBeNull();
    });

    it("returns null success message when case not found", () => {
      const result = createCaseListViewModel(
        mockCasesWithUsers,
        "non-existent-case",
      );

      expect(result.data.assignedUserSuccessMessage).toBeNull();
    });

    it("returns null success message when case found but no assigned user", () => {
      const result = createCaseListViewModel(
        mockCasesWithUsers,
        "case-without-user",
      );

      expect(result.data.assignedUserSuccessMessage).toBeNull();
    });

    it("returns success message when case found with assigned user", () => {
      const result = createCaseListViewModel(
        mockCasesWithUsers,
        "case-with-user-1",
      );

      expect(result.data.assignedUserSuccessMessage).toEqual({
        heading: "Case assigned successfully",
        ref: "CLIENT-001",
        link: "/cases/case-with-user-1",
        assignedUserName: "John Doe",
      });
    });
  });
});

const mockCasesWithUsers = [
  {
    _id: "case-with-user-1",
    payload: {
      clientRef: "CLIENT-001",
      code: "CODE-001",
      submittedAt: "2021-01-15T00:00:00.000Z",
    },
    status: "In Progress",
    assignedUser: {
      id: "user-1",
      name: "John Doe",
    },
  },
  {
    _id: "case-with-user-2",
    payload: {
      clientRef: "CLIENT-002",
      code: "CODE-002",
      submittedAt: "2021-02-20T00:00:00.000Z",
    },
    status: "New",
    assignedUser: {
      id: "user-2",
      name: "Jane Smith",
    },
  },
  {
    _id: "case-without-user",
    payload: {
      clientRef: "CLIENT-003",
      code: "CODE-003",
      submittedAt: "2021-03-10T00:00:00.000Z",
    },
    status: "Draft",
    assignedUser: null,
  },
];

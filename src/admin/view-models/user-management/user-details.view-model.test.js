import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DATE_FORMAT_FULL_DATE_TIME,
  formatDate,
} from "../../../common/nunjucks/filters/format-date.js";
import { createUserDetailsViewModel } from "./user-details.view-model.js";

vi.mock("../../../common/view-models/header.view-model.js");

const mockRequest = { path: "/admin/user-management/users/user-123" };

const createMockPage = (userData) => ({
  data: userData,
  header: { navItems: [] },
});

describe("createUserDetailsViewModel", () => {
  it("filters IDP roles to FCP.Casework roles only", () => {
    const viewModel = createUserDetailsViewModel({
      page: createMockPage({
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        updatedAt: null,
        idpRoles: ["FCP.Casework.Admin", "Other.Role"],
        appRoles: {},
      }),
      request: mockRequest,
      currentUser: { id: "someone-else" },
    });

    expect(viewModel.data.idpRoles).toEqual(["FCP.Casework.Admin"]);
  });

  it("uses empty IDP roles when missing", () => {
    const viewModel = createUserDetailsViewModel({
      page: createMockPage({
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        updatedAt: null,
        appRoles: {},
      }),
      request: mockRequest,
      currentUser: { id: "someone-else" },
    });

    expect(viewModel.data.idpRoles).toEqual([]);
  });

  it("uses empty app roles when missing", () => {
    const viewModel = createUserDetailsViewModel({
      page: createMockPage({
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        updatedAt: null,
        idpRoles: [],
      }),
      request: mockRequest,
      currentUser: { id: "someone-else" },
    });

    expect(viewModel.data.appRoles).toEqual([]);
  });

  it("formats last login when updatedAt is present", () => {
    const updatedAt = "2026-01-13T16:06:00.000Z";

    const viewModel = createUserDetailsViewModel({
      page: createMockPage({
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        updatedAt: "2026-01-13T16:06:00.000Z",
        lastLoginAt: updatedAt,
        idpRoles: [],
        appRoles: {},
      }),
      request: mockRequest,
      currentUser: { id: "someone-else" },
    });

    expect(viewModel.data.summary.rows[1].value.text).toEqual(
      formatDate(updatedAt, DATE_FORMAT_FULL_DATE_TIME),
    );
  });

  it("uses blank last login when updatedAt is missing", () => {
    const viewModel = createUserDetailsViewModel({
      page: createMockPage({
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        idpRoles: [],
        appRoles: {},
      }),
      request: mockRequest,
      currentUser: { id: "someone-else" },
    });

    expect(viewModel.data.summary.rows[1].value.text).toEqual("");
  });

  it("hides edit roles when viewing own record", () => {
    const viewModel = createUserDetailsViewModel({
      page: createMockPage({
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        updatedAt: null,
        idpRoles: [],
        appRoles: {},
      }),
      request: mockRequest,
      currentUser: { id: "user-123" },
    });

    expect(viewModel.data.showEditRoles).toEqual(false);
  });

  it("shows edit roles when viewing another user", () => {
    const viewModel = createUserDetailsViewModel({
      page: createMockPage({
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        updatedAt: null,
        idpRoles: [],
        appRoles: {},
      }),
      request: mockRequest,
      currentUser: { id: "admin-user" },
    });

    expect(viewModel.data.showEditRoles).toEqual(true);
  });

  it("throws when currentUser is missing", () => {
    expect(() =>
      createUserDetailsViewModel({
        page: createMockPage({
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
          updatedAt: null,
          idpRoles: [],
          appRoles: {},
        }),
        request: mockRequest,
        currentUser: undefined,
      }),
    ).toThrow("currentUser is required");
  });

  it("throws when currentUser has no id", () => {
    expect(() =>
      createUserDetailsViewModel({
        page: createMockPage({
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
          updatedAt: null,
          idpRoles: [],
          appRoles: {},
        }),
        request: mockRequest,
        currentUser: {},
      }),
    ).toThrow("currentUser is required");
  });

  it("exposes app role keys and builds the edit roles href", () => {
    const viewModel = createUserDetailsViewModel({
      page: createMockPage({
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        updatedAt: null,
        idpRoles: [],
        appRoles: {
          "Role.A": {},
          "Role.B": {},
        },
      }),
      request: mockRequest,
      currentUser: { id: "admin-user" },
    });

    expect(viewModel.data.appRoles).toEqual(["Role.A", "Role.B"]);
    expect(viewModel.data.editRolesHref).toEqual(
      "/admin/user-management/users/user-123/roles",
    );
  });

  describe("app role filtering by date", () => {
    const findRow = (rows, keyText) =>
      rows.find((row) => row.key.text === keyText);

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-01"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("splits roles into active, expired and future rows", () => {
      const viewModel = createUserDetailsViewModel({
        page: createMockPage({
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
          updatedAt: null,
          idpRoles: [],
          appRoles: {
            ROLE_ACTIVE: { startDate: "2005-01-01", endDate: "2026-01-01" },
            ROLE_EXPIRED: { startDate: "2005-01-01", endDate: "2025-01-01" },
            ROLE_FUTURE: { startDate: "2026-01-01", endDate: "2027-01-01" },
          },
        }),
        request: mockRequest,
        currentUser: { id: "admin-user" },
      });

      const { rows } = viewModel.data.summary;
      expect(findRow(rows, "Manage grants roles").value.html).toEqual(
        "ROLE_ACTIVE",
      );
      expect(findRow(rows, "Expired Manage grants roles").value.html).toEqual(
        "ROLE_EXPIRED",
      );
      expect(findRow(rows, "Future Manage grants roles").value.html).toEqual(
        "ROLE_FUTURE",
      );
    });

    it("omits expired and future rows when no roles match", () => {
      const viewModel = createUserDetailsViewModel({
        page: createMockPage({
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
          updatedAt: null,
          idpRoles: [],
          appRoles: {
            ROLE_NO_END: { startDate: "2005-01-01" },
            ROLE_EMPTY: {},
          },
        }),
        request: mockRequest,
        currentUser: { id: "admin-user" },
      });

      const { rows } = viewModel.data.summary;
      expect(findRow(rows, "Manage grants roles").value.html).toEqual(
        "ROLE_NO_END,<br>ROLE_EMPTY",
      );
      expect(findRow(rows, "Expired Manage grants roles")).toBeUndefined();
      expect(findRow(rows, "Future Manage grants roles")).toBeUndefined();
    });

    it("shows future row and omits expired row when only future roles exist", () => {
      const viewModel = createUserDetailsViewModel({
        page: createMockPage({
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
          updatedAt: null,
          idpRoles: [],
          appRoles: {
            ROLE_FUTURE: { startDate: "2026-01-01" },
          },
        }),
        request: mockRequest,
        currentUser: { id: "admin-user" },
      });

      const { rows } = viewModel.data.summary;
      expect(findRow(rows, "Manage grants roles").value.text).toEqual(
        "No Manage grants roles have been allocated to this user",
      );
      expect(findRow(rows, "Expired Manage grants roles")).toBeUndefined();
      expect(findRow(rows, "Future Manage grants roles").value.html).toEqual(
        "ROLE_FUTURE",
      );
    });

    it("shows expired row and omits future row when all roles are expired", () => {
      const viewModel = createUserDetailsViewModel({
        page: createMockPage({
          id: "user-123",
          name: "Test User",
          email: "test@example.com",
          updatedAt: null,
          idpRoles: [],
          appRoles: {
            ROLE_EXPIRED_A: { endDate: "2024-01-01" },
            ROLE_EXPIRED_B: { endDate: "2023-06-15" },
          },
        }),
        request: mockRequest,
        currentUser: { id: "admin-user" },
      });

      const { rows } = viewModel.data.summary;
      expect(findRow(rows, "Manage grants roles").value.text).toEqual(
        "No Manage grants roles have been allocated to this user",
      );
      expect(findRow(rows, "Expired Manage grants roles").value.html).toEqual(
        "ROLE_EXPIRED_A,<br>ROLE_EXPIRED_B",
      );
      expect(findRow(rows, "Future Manage grants roles")).toBeUndefined();
    });
  });
});

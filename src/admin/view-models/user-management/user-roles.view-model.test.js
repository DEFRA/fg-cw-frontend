import { describe, expect, it, vi } from "vitest";
import { createUserRolesViewModel } from "./user-roles.view-model.js";

vi.mock("../../../common/view-models/header.view-model.js");

const mockRequest = { path: "/admin/user-management/users/user-123/roles" };

const createMockPage = (userData) => ({
  data: userData,
  header: { navItems: [] },
});

describe("createUserRolesViewModel", () => {
  it("includes roles from the table view model", () => {
    const viewModel = createUserRolesViewModel({
      page: createMockPage({
        id: "user-123",
        name: "Martin Smith",
        appRoles: {
          PMF_READ: {},
        },
      }),
      request: mockRequest,
      userId: "user-123",
      roles: {
        header: { navItems: [] },
        data: [
          {
            id: "r1",
            code: "PMF_READ",
            description: "Pigs Might Fly read only",
            assignable: true,
          },
        ],
      },
    });

    expect(viewModel.data.selectedRoles).toEqual([
      expect.objectContaining({
        code: "PMF_READ",
      }),
    ]);
    expect(viewModel.data.unselectedRoles).toEqual([]);
    expect(viewModel.data.formAction).toEqual(
      "/admin/user-management/users/user-123/roles",
    );
    expect(viewModel.data.cancelHref).toEqual(
      "/admin/user-management/users/user-123",
    );
  });

  it("defaults errors and errorList when errors undefined", () => {
    const viewModel = createUserRolesViewModel({
      page: createMockPage({
        id: "user-123",
        name: "Martin Smith",
        appRoles: {},
      }),
      request: mockRequest,
      userId: "user-123",
      roles: [],
      errors: undefined,
    });

    expect(viewModel.errors).toEqual({});
    expect(viewModel.errorList).toEqual([]);
  });

  it("builds an error summary item without href for save errors", () => {
    const viewModel = createUserRolesViewModel({
      page: createMockPage({
        id: "user-123",
        name: "Martin Smith",
        appRoles: {},
      }),
      request: mockRequest,
      userId: "user-123",
      roles: [],
      errors: {
        save: "There was a problem saving",
      },
    });

    expect(viewModel.errorList).toEqual([
      {
        text: "There was a problem saving",
      },
    ]);
  });

  it("filters out empty validation messages from errorList", () => {
    const viewModel = createUserRolesViewModel({
      page: createMockPage({
        id: "user-123",
        name: "Martin Smith",
        appRoles: {},
      }),
      request: mockRequest,
      userId: "user-123",
      roles: [],
      errors: {
        startDate__PMF_READ: "",
      },
    });

    expect(viewModel.errorList).toEqual([]);
  });

  it("uses date order field errors directly in summary", () => {
    const viewModel = createUserRolesViewModel({
      page: createMockPage({
        id: "user-123",
        name: "Martin Smith",
        appRoles: {},
      }),
      request: mockRequest,
      userId: "user-123",
      roles: [],
      errors: {
        startDate__PMF_READ: "Start date cannot be after end date",
        endDate__PMF_WRITE: "End date cannot be before start date",
      },
    });

    expect(viewModel.errorList).toEqual([
      {
        text: "Start date cannot be after end date",
        href: "#startDate__PMF_READ",
      },
      {
        text: "End date cannot be before start date",
        href: "#endDate__PMF_WRITE",
      },
    ]);
  });
});

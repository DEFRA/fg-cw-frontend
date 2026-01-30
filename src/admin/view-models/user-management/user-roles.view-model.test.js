import { describe, expect, it, vi } from "vitest";
import { createUserRolesViewModel } from "./user-roles.view-model.js";

vi.mock("../../../common/view-models/header.view-model.js");

const mockRequest = { path: "/admin/user-management/user-123/roles" };

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
      roles: [
        {
          id: "r1",
          code: "PMF_READ",
          description: "Pigs Might Fly read only",
          assignable: true,
        },
      ],
    });

    expect(viewModel.data.roles).toEqual([
      expect.objectContaining({
        code: "PMF_READ",
      }),
    ]);
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
});

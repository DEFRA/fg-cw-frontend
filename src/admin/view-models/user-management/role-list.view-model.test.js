import { describe, expect, it, vi } from "vitest";
import { createRoleListViewModel } from "./role-list.view-model.js";

vi.mock("../../../common/view-models/header.view-model.js");

const mockRequest = { path: "/admin/user-management/roles" };

const createMockPage = (roles) => ({
  data: roles,
  header: { navItems: [] },
});

describe("createRoleListViewModel", () => {
  it("maps roles to view model correctly", () => {
    const roles = [
      { code: "ROLE_A", description: "Role A", assignable: false },
      { code: "ROLE_B", description: "Role B", assignable: true },
    ];

    const viewModel = createRoleListViewModel({
      page: createMockPage(roles),
      request: mockRequest,
    });

    expect(viewModel.pageTitle).toEqual("Roles");
    expect(viewModel.pageHeading).toEqual("Roles");
    expect(viewModel.breadcrumbs).toEqual([
      { text: "User management", href: "/admin" },
      { text: "Roles" },
    ]);
    expect(viewModel.data.createRoleHref).toEqual(
      "/admin/user-management/roles/new",
    );

    expect(viewModel.data.roles.rows).toEqual([
      {
        code: {
          text: "ROLE_A",
          href: "/admin/user-management/roles/ROLE_A",
        },
        description: "Role A",
        assignable: "No",
      },
      {
        code: {
          text: "ROLE_B",
          href: "/admin/user-management/roles/ROLE_B",
        },
        description: "Role B",
        assignable: "Yes",
      },
    ]);
  });

  it("handles empty roles list", () => {
    const viewModel = createRoleListViewModel({
      page: createMockPage([]),
      request: mockRequest,
    });
    expect(viewModel.data.roles.rows).toEqual([]);
  });

  it("handles null roles list", () => {
    const viewModel = createRoleListViewModel({
      page: createMockPage(null),
      request: mockRequest,
    });
    expect(viewModel.data.roles.rows).toEqual([]);
  });
});

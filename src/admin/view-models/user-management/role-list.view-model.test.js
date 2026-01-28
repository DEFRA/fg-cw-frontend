import { describe, expect, it } from "vitest";
import { createRoleListViewModel } from "./role-list.view-model.js";

describe("createRoleListViewModel", () => {
  it("maps roles to view model correctly", () => {
    const roles = [
      { code: "ROLE_A", description: "Role A", assignable: false },
      { code: "ROLE_B", description: "Role B", assignable: true },
    ];

    const viewModel = createRoleListViewModel(roles);

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
    const viewModel = createRoleListViewModel([]);
    expect(viewModel.data.roles.rows).toEqual([]);
  });

  it("handles null roles list", () => {
    const viewModel = createRoleListViewModel(null);
    expect(viewModel.data.roles.rows).toEqual([]);
  });
});

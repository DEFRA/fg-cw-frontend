import { describe, expect, it } from "vitest";
import { createAdminLandingViewModel } from "./admin-landing.view-model.js";

describe("createAdminLandingViewModel", () => {
  it("returns correct page title", () => {
    const viewModel = createAdminLandingViewModel();

    expect(viewModel.pageTitle).toEqual("Users and roles");
  });

  it("returns correct page heading", () => {
    const viewModel = createAdminLandingViewModel();

    expect(viewModel.pageHeading).toEqual("Users and roles");
  });

  it("returns Users section with correct link", () => {
    const viewModel = createAdminLandingViewModel();

    const usersSection = viewModel.sections.find((s) => s.title === "Users");
    expect(usersSection).toEqual({
      title: "Users",
      description: "Check and update what users can do.",
      linkText: "Manage users",
      linkHref: "/admin/user-management",
    });
  });

  it("returns Roles section with correct link", () => {
    const viewModel = createAdminLandingViewModel();

    const rolesSection = viewModel.sections.find((s) => s.title === "Roles");
    expect(rolesSection).toEqual({
      title: "Roles",
      description: "Check and edit roles, or create new ones.",
      linkText: "Manage roles",
      linkHref: "/admin/user-management/roles",
    });
  });

  it("returns two sections", () => {
    const viewModel = createAdminLandingViewModel();

    expect(viewModel.sections).toHaveLength(2);
  });
});

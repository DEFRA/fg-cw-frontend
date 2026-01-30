import { describe, expect, it, vi } from "vitest";
import { createAdminLandingViewModel } from "./admin-landing.view-model.js";

vi.mock("../../common/view-models/header.view-model.js");

const mockRequest = { path: "/admin" };

const createMockPage = () => ({
  data: {},
  header: { navItems: [] },
});

describe("createAdminLandingViewModel", () => {
  it("returns correct page title", () => {
    const viewModel = createAdminLandingViewModel({
      page: createMockPage(),
      request: mockRequest,
    });

    expect(viewModel.pageTitle).toEqual("Users and roles");
  });

  it("returns correct page heading", () => {
    const viewModel = createAdminLandingViewModel({
      page: createMockPage(),
      request: mockRequest,
    });

    expect(viewModel.pageHeading).toEqual("Users and roles");
  });

  it("returns Users section with correct link", () => {
    const viewModel = createAdminLandingViewModel({
      page: createMockPage(),
      request: mockRequest,
    });

    const usersSection = viewModel.sections.find((s) => s.title === "Users");
    expect(usersSection).toEqual({
      title: "Users",
      description: "Check and update what users can do.",
      linkText: "Manage users",
      linkHref: "/admin/user-management",
    });
  });

  it("returns Roles section with correct link", () => {
    const viewModel = createAdminLandingViewModel({
      page: createMockPage(),
      request: mockRequest,
    });

    const rolesSection = viewModel.sections.find((s) => s.title === "Roles");
    expect(rolesSection).toEqual({
      title: "Roles",
      description: "Check and edit roles, or create new ones.",
      linkText: "Manage roles",
      linkHref: "/admin/user-management/roles",
    });
  });

  it("returns two sections", () => {
    const viewModel = createAdminLandingViewModel({
      page: createMockPage(),
      request: mockRequest,
    });

    expect(viewModel.sections).toHaveLength(2);
  });
});

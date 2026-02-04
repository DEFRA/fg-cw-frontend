import { describe, expect, it } from "vitest";
import { createRoleDetailsViewModel } from "./role-details.view-model.js";

const mockRequest = { path: "/admin/user-management/roles/PMF_READ" };

const createMockPage = () => ({
  data: {},
  header: { navItems: [] },
});

describe("createRoleDetailsViewModel", () => {
  it("maps role details and breadcrumbs", () => {
    const viewModel = createRoleDetailsViewModel({
      page: createMockPage(),
      request: mockRequest,
      role: {
        data: {
          code: "PMF_READ",
          description: "Read only",
          assignable: true,
        },
      },
    });

    expect(viewModel.pageTitle).toEqual("Update PMF_READ");
    expect(viewModel.pageHeading).toEqual("Update PMF_READ");
    expect(viewModel.breadcrumbs).toEqual([
      { text: "User management", href: "/admin" },
      { text: "Roles", href: "/admin/user-management/roles" },
      { text: "PMF_READ" },
    ]);
    expect(viewModel.data.formAction).toEqual(
      "/admin/user-management/roles/PMF_READ",
    );
    expect(viewModel.data.form).toEqual({
      description: "Read only",
      assignable: "true",
    });
  });

  it("uses form data when provided", () => {
    const viewModel = createRoleDetailsViewModel({
      page: createMockPage(),
      request: mockRequest,
      role: {
        data: {
          code: "PMF_READ",
          description: "Read only",
          assignable: true,
        },
      },
      formData: {
        description: "Updated",
        assignable: "false",
      },
    });

    expect(viewModel.data.form).toEqual({
      description: "Updated",
      assignable: "false",
    });
  });

  it("builds error list with hrefs", () => {
    const viewModel = createRoleDetailsViewModel({
      page: createMockPage(),
      request: mockRequest,
      role: { data: { code: "PMF_READ" } },
      errors: {
        description: "Enter a description",
      },
    });

    expect(viewModel.errorList).toEqual([
      { text: "Enter a description", href: "#description" },
    ]);
  });

  it("omits error href for save errors", () => {
    const viewModel = createRoleDetailsViewModel({
      page: createMockPage(),
      request: mockRequest,
      role: { data: { code: "PMF_READ" } },
      errors: {
        save: "There was a problem",
      },
    });

    expect(viewModel.errorList).toEqual([{ text: "There was a problem" }]);
  });
});

import { describe, expect, it, vi } from "vitest";
import { createHeaderViewModel } from "../../../common/view-models/header.view-model.js";
import { createCreateUserViewModel } from "./create-user.view-model.js";

vi.mock("../../../common/view-models/header.view-model.js");

const createMockPage = () => ({
  data: {},
  header: { navItems: [] },
});

const createMockRequest = () => ({
  path: "/admin/user-management/create",
});

describe("createCreateUserViewModel", () => {
  it("creates view model with default values when no errors or form data", () => {
    const page = createMockPage();
    const request = createMockRequest();
    createHeaderViewModel.mockReturnValue({ navItems: [] });

    const viewModel = createCreateUserViewModel({ page, request });

    expect(viewModel.pageTitle).toBe("Create user");
    expect(viewModel.pageHeading).toBe("Create user");
    expect(viewModel.breadcrumbs).toEqual([
      { text: "User management", href: "/admin/user-management" },
      { text: "Users", href: "/admin/user-management" },
      { text: "Create user" },
    ]);
    expect(viewModel.data.formData).toEqual({});
    expect(viewModel.data.cancelHref).toBe("/admin/user-management");
    expect(viewModel.errors).toEqual({});
    expect(viewModel.errorList).toEqual([]);
  });

  it("includes header in view model", () => {
    const page = createMockPage();
    const request = createMockRequest();
    const mockHeader = { navItems: [{ text: "Admin", href: "/admin" }] };
    createHeaderViewModel.mockReturnValue(mockHeader);

    const viewModel = createCreateUserViewModel({ page, request });

    expect(createHeaderViewModel).toHaveBeenCalledWith({ page, request });
    expect(viewModel.header).toEqual(mockHeader);
  });

  it("preserves form data when provided", () => {
    const page = createMockPage();
    const request = createMockRequest();
    const formData = { name: "Test Name", email: "test@example.com" };
    createHeaderViewModel.mockReturnValue({ navItems: [] });

    const viewModel = createCreateUserViewModel({ page, request, formData });

    expect(viewModel.data.formData).toEqual(formData);
  });

  it("includes name error in error list", () => {
    const page = createMockPage();
    const request = createMockRequest();
    const errors = { name: "Enter a name" };
    createHeaderViewModel.mockReturnValue({ navItems: [] });

    const viewModel = createCreateUserViewModel({
      page,
      request,
      errors,
      formData: {},
    });

    expect(viewModel.errors).toEqual(errors);
    expect(viewModel.errorList).toEqual([
      { text: "Enter a name", href: "#name" },
    ]);
  });

  it("includes email error in error list", () => {
    const page = createMockPage();
    const request = createMockRequest();
    const errors = { email: "Enter a valid email address" };
    createHeaderViewModel.mockReturnValue({ navItems: [] });

    const viewModel = createCreateUserViewModel({
      page,
      request,
      errors,
      formData: {},
    });

    expect(viewModel.errors).toEqual(errors);
    expect(viewModel.errorList).toEqual([
      { text: "Enter a valid email address", href: "#email" },
    ]);
  });

  it("includes save error in error list without href", () => {
    const page = createMockPage();
    const request = createMockRequest();
    const errors = { save: "There was a problem creating the user" };
    createHeaderViewModel.mockReturnValue({ navItems: [] });

    const viewModel = createCreateUserViewModel({
      page,
      request,
      errors,
      formData: {},
    });

    expect(viewModel.errorList).toEqual([
      { text: "There was a problem creating the user" },
    ]);
  });

  it("includes multiple errors in error list in correct order", () => {
    const page = createMockPage();
    const request = createMockRequest();
    const errors = {
      name: "Enter a name",
      email: "Enter a valid email address",
    };
    createHeaderViewModel.mockReturnValue({ navItems: [] });

    const viewModel = createCreateUserViewModel({
      page,
      request,
      errors,
      formData: {},
    });

    expect(viewModel.errorList).toEqual([
      { text: "Enter a name", href: "#name" },
      { text: "Enter a valid email address", href: "#email" },
    ]);
  });
});

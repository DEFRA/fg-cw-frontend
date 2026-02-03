import { describe, expect, it } from "vitest";
import { createCreateUserViewModel } from "./create-user.view-model.js";

describe("createCreateUserViewModel", () => {
  it("creates view model with default values when no errors or form data", () => {
    const viewModel = createCreateUserViewModel(null, null);

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

  it("preserves form data when provided", () => {
    const formData = { name: "Test Name", email: "test@example.com" };
    const viewModel = createCreateUserViewModel(null, formData);

    expect(viewModel.data.formData).toEqual(formData);
  });

  it("includes name error in error list", () => {
    const errors = { name: "Enter a name" };
    const viewModel = createCreateUserViewModel(errors, {});

    expect(viewModel.errors).toEqual(errors);
    expect(viewModel.errorList).toEqual([
      { text: "Enter a name", href: "#name" },
    ]);
  });

  it("includes email error in error list", () => {
    const errors = { email: "Enter a valid email address" };
    const viewModel = createCreateUserViewModel(errors, {});

    expect(viewModel.errors).toEqual(errors);
    expect(viewModel.errorList).toEqual([
      { text: "Enter a valid email address", href: "#email" },
    ]);
  });

  it("includes save error in error list without href", () => {
    const errors = { save: "There was a problem creating the user" };
    const viewModel = createCreateUserViewModel(errors, {});

    expect(viewModel.errorList).toEqual([
      { text: "There was a problem creating the user" },
    ]);
  });

  it("includes multiple errors in error list in correct order", () => {
    const errors = {
      name: "Enter a name",
      email: "Enter a valid email address",
    };
    const viewModel = createCreateUserViewModel(errors, {});

    expect(viewModel.errorList).toEqual([
      { text: "Enter a name", href: "#name" },
      { text: "Enter a valid email address", href: "#email" },
    ]);
  });
});

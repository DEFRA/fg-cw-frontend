import { describe, expect, it } from "vitest";
import { createNewRoleViewModel } from "./role-create.view-model.js";

describe("createNewRoleViewModel", () => {
  it("defaults form data and errors", () => {
    const viewModel = createNewRoleViewModel();

    expect(viewModel.data.formData).toEqual({
      code: "",
      description: "",
      assignable: "",
    });
    expect(viewModel.errors).toEqual({});
    expect(viewModel.errorList).toEqual([]);
  });

  it("maps errors to errorList with anchors", () => {
    const viewModel = createNewRoleViewModel({
      errors: {
        code: "Enter a role code",
        description: "Enter a role description",
        assignable: "Select whether the role is assignable",
        save: "There was a problem",
      },
    });

    expect(viewModel.errorList).toEqual([
      { text: "Enter a role code", href: "#code" },
      { text: "Enter a role description", href: "#description" },
      {
        text: "Select whether the role is assignable",
        href: "#assignable",
      },
      { text: "There was a problem" },
    ]);
  });
});

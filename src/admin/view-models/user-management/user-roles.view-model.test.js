import { describe, expect, it } from "vitest";
import { createUserRolesViewModel } from "./user-roles.view-model.js";

describe("createUserRolesViewModel", () => {
  it("includes roles from the table view model", () => {
    const viewModel = createUserRolesViewModel({
      user: {
        id: "user-123",
        name: "Martin Smith",
        appRoles: {
          PMF_READ: {},
        },
      },
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
});

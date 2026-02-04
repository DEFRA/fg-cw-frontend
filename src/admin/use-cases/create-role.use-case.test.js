import { describe, expect, it, vi } from "vitest";
import { create } from "../repositories/roles.repository.js";
import { createRoleUseCase } from "./create-role.use-case.js";

vi.mock("../repositories/roles.repository.js");

describe("createRoleUseCase", () => {
  it("creates a role via repository", async () => {
    const authContext = { token: "token-123" };
    const roleData = {
      code: "ROLE_TEST",
      description: "Test role",
      assignable: false,
    };

    await createRoleUseCase(authContext, roleData);

    expect(create).toHaveBeenCalledWith(authContext, roleData);
  });
});

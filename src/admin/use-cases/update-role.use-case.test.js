import { describe, expect, it, vi } from "vitest";

import { updateRoleUseCase } from "./update-role.use-case.js";

vi.mock("../repositories/roles.repository.js", () => ({
  updateRole: vi.fn(),
}));

describe("updateRoleUseCase", () => {
  it("updates role via repository", async () => {
    const { updateRole } = await import("../repositories/roles.repository.js");

    const authContext = { token: "token-123" };
    const role = { description: "Read only", assignable: true };

    updateRole.mockResolvedValue({ code: "PMF_READ" });

    const result = await updateRoleUseCase(authContext, "PMF_READ", role);

    expect(updateRole).toHaveBeenCalledWith(authContext, "PMF_READ", role);
    expect(result).toEqual({ code: "PMF_READ" });
  });
});

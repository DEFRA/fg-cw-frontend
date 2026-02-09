import { describe, expect, it, vi } from "vitest";

import { updateUserRolesUseCase } from "./update-user-roles.use-case.js";

vi.mock("../../auth/repositories/user.repository.js", () => ({
  update: vi.fn(),
}));

describe("updateUserRolesUseCase", () => {
  it("calls user repository update with appRoles payload", async () => {
    const { update } =
      await import("../../auth/repositories/user.repository.js");

    const authContext = { token: "token-123" };
    const userId = "user-123";
    const appRoles = { PMF_READ: { startDate: "2026-01-01" } };

    update.mockResolvedValue({ ok: true });

    const result = await updateUserRolesUseCase(authContext, userId, appRoles);

    expect(update).toHaveBeenCalledWith(authContext, userId, { appRoles });
    expect(result).toEqual({ ok: true });
  });
});

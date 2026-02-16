import { describe, expect, it, vi } from "vitest";
import { findUserRolesDataUseCase } from "./find-user-roles-data.use-case.js";

vi.mock("../../auth/repositories/user.repository.js", () => ({
  adminFindById: vi.fn(),
}));

vi.mock("../repositories/roles.repository.js", () => ({
  findAll: vi.fn(),
}));

describe("findUserRolesDataUseCase", () => {
  it("loads page and roles data with a shared auth context", async () => {
    const { adminFindById } =
      await import("../../auth/repositories/user.repository.js");
    const { findAll } = await import("../repositories/roles.repository.js");

    const authContext = { token: "token-123", user: { id: "admin-user" } };
    const userId = "user-123";
    const page = { data: { id: userId } };
    const roles = { data: [{ code: "PMF_READ" }] };

    adminFindById.mockResolvedValue(page);
    findAll.mockResolvedValue(roles);

    const result = await findUserRolesDataUseCase(authContext, userId);

    expect(adminFindById).toHaveBeenCalledWith(authContext, userId);
    expect(findAll).toHaveBeenCalledWith(authContext);
    expect(result).toEqual({ page, roles });
  });
});

import { describe, expect, it, vi } from "vitest";

import { findRoleUseCase } from "./find-role.use-case.js";

vi.mock("../repositories/roles.repository.js", () => ({
  findByCode: vi.fn(),
}));

describe("findRoleUseCase", () => {
  it("returns role from repository", async () => {
    const { findByCode } = await import("../repositories/roles.repository.js");

    const authContext = { token: "token-123" };
    findByCode.mockResolvedValue({ code: "PMF_READ" });

    const result = await findRoleUseCase(authContext, "PMF_READ");

    expect(findByCode).toHaveBeenCalledWith(authContext, "PMF_READ");
    expect(result).toEqual({ code: "PMF_READ" });
  });
});

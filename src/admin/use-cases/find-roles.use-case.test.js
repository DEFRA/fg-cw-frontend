import { describe, expect, it, vi } from "vitest";

import { findRolesUseCase } from "./find-roles.use-case.js";

vi.mock("../repositories/roles.repository.js", () => ({
  findAll: vi.fn(),
}));

describe("findRolesUseCase", () => {
  it("returns roles from repository", async () => {
    const { findAll } = await import("../repositories/roles.repository.js");

    const authContext = { token: "token-123" };
    findAll.mockResolvedValue([{ code: "PMF_READ" }]);

    const result = await findRolesUseCase(authContext);

    expect(findAll).toHaveBeenCalledWith(authContext);
    expect(result).toEqual([{ code: "PMF_READ" }]);
  });
});

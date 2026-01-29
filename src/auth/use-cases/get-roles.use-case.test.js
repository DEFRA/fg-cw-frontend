import { describe, expect, it, vi } from "vitest";
import { getRoles } from "../repositories/role.repository.js";
import { getRolesUseCase } from "./get-roles.use-case.js";

vi.mock("../repositories/role.repository.js");

describe("getRolesUseCase", () => {
  it("returns roles from repository", async () => {
    const authContext = { token: "token" };
    const mockRoles = [{ code: "ROLE_1" }];

    getRoles.mockResolvedValue(mockRoles);

    const result = await getRolesUseCase(authContext);

    expect(getRoles).toHaveBeenCalledWith(authContext);
    expect(result).toEqual(mockRoles);
  });
});

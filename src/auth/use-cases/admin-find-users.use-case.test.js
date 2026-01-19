import { describe, expect, it, vi } from "vitest";

import { adminFindUsers } from "../repositories/user.repository.js";
import { adminFindUsersUseCase } from "./admin-find-users.use-case.js";

vi.mock("../repositories/user.repository.js");

describe("adminFindUsersUseCase", () => {
  it("returns users from repository", async () => {
    const authContext = { token: "token" };
    const query = { idpId: "some-idp-id" };

    adminFindUsers.mockResolvedValue([{ id: "user-1" }]);

    const result = await adminFindUsersUseCase(authContext, query);

    expect(adminFindUsers).toHaveBeenCalledWith(authContext, query);
    expect(result).toEqual([{ id: "user-1" }]);
  });
});

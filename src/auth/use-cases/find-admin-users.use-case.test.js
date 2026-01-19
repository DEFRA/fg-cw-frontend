import { describe, expect, it, vi } from "vitest";

import { findAdminUsers } from "../repositories/user.repository.js";
import { findAdminUsersUseCase } from "./find-admin-users.use-case.js";

vi.mock("../repositories/user.repository.js");

describe("findAdminUsersUseCase", () => {
  it("returns users from repository", async () => {
    const authContext = { token: "token" };
    const query = { idpId: "some-idp-id" };

    findAdminUsers.mockResolvedValue([{ id: "user-1" }]);

    const result = await findAdminUsersUseCase(authContext, query);

    expect(findAdminUsers).toHaveBeenCalledWith(authContext, query);
    expect(result).toEqual([{ id: "user-1" }]);
  });
});

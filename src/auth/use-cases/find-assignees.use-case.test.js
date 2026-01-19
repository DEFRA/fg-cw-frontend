import { describe, expect, it, vi } from "vitest";

import { findAssignees } from "../repositories/user.repository.js";
import { findAssigneesUseCase } from "./find-assignees.use-case.js";

vi.mock("../repositories/user.repository.js");

describe("findAssigneesUseCase", () => {
  it("returns assignees from repository", async () => {
    const authContext = { token: "token" };
    const query = { anyAppRoles: ["role1"], allAppRoles: [] };

    findAssignees.mockResolvedValue([{ id: "user-1", name: "Alice" }]);

    const result = await findAssigneesUseCase(authContext, query);

    expect(findAssignees).toHaveBeenCalledWith(authContext, query);
    expect(result).toEqual([{ id: "user-1", name: "Alice" }]);
  });
});

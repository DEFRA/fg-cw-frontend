import { describe, expect, it, vi } from "vitest";
import { findAll } from "../repositories/user.repository.js";
import { findAllUsersUseCase } from "./find-all-users.use-case.js";

vi.mock("../repositories/user.repository.js");

describe("findAllUsersUseCase", () => {
  it("returns users from repository with query parameters", async () => {
    findAll.mockResolvedValue(mockUsers);

    const result = await findAllUsersUseCase(query);

    expect(findAll).toHaveBeenCalledWith(query);
    expect(result).toEqual(mockUsers);
  });
});

const query = {
  idpId: "test-idp",
  allAppRoles: ["admin", "manager"],
  anyAppRoles: ["reviewer"],
};

const mockUsers = [
  {
    id: "user-1",
    name: "John Doe",
    appRoles: ["admin", "manager", "reviewer"],
  },
  {
    id: "user-2",
    name: "Jane Smith",
    appRoles: ["admin", "manager"],
  },
];

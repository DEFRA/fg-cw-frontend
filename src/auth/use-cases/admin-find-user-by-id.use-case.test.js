import { describe, expect, it, vi } from "vitest";
import { adminFindById } from "../repositories/user.repository.js";
import { adminFindUserByIdUseCase } from "./admin-find-user-by-id.use-case.js";

vi.mock("../repositories/user.repository.js");

describe("adminFindUserByIdUseCase", () => {
  it("returns user from repository", async () => {
    const authContext = { token: "mock-token" };

    adminFindById.mockResolvedValue({
      id: "user-123",
      name: "Test User",
    });

    const user = await adminFindUserByIdUseCase(authContext, "user-123");

    expect(adminFindById).toHaveBeenCalledWith(authContext, "user-123");
    expect(user).toEqual({
      id: "user-123",
      name: "Test User",
    });
  });
});

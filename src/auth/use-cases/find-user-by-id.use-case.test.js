import { describe, expect, it, vi } from "vitest";
import { findById } from "../repositories/user.repository.js";
import { findUserByIdUseCase } from "./find-user-by-id.use-case.js";

vi.mock("../repositories/user.repository.js");

describe("findUserByIdUseCase", () => {
  it("returns user from repository", async () => {
    const authContext = { token: "mock-token" };

    findById.mockResolvedValue({
      id: "user-123",
      name: "Test User",
    });

    const user = await findUserByIdUseCase(authContext, "user-123");

    expect(findById).toHaveBeenCalledWith(authContext, "user-123");
    expect(user).toEqual({
      id: "user-123",
      name: "Test User",
    });
  });
});

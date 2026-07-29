import { describe, expect, it, vi } from "vitest";
import { logout } from "../repositories/user.repository.js";
import { logoutUserUseCase } from "./logout-user.use-case.js";

vi.mock("../repositories/user.repository.js");

describe("logoutUserUseCase", () => {
  const authContext = { token: "mock-token" };

  it("calls the repository logout with the user id", async () => {
    logout.mockResolvedValue(undefined);

    await logoutUserUseCase(authContext, {
      userId: "69691417bd385df3ac6aa25f",
    });

    expect(logout).toHaveBeenCalledWith(authContext, {
      userId: "69691417bd385df3ac6aa25f",
    });
  });

  it("propagates repository errors to the caller", async () => {
    logout.mockRejectedValue(new Error("backend unavailable"));

    await expect(
      logoutUserUseCase(authContext, { userId: "69691417bd385df3ac6aa25f" }),
    ).rejects.toThrow("backend unavailable");
  });
});

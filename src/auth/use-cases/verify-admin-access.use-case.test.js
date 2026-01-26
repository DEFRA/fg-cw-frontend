import { describe, expect, it, vi } from "vitest";

import { adminAccessCheck } from "../repositories/user.repository.js";
import { verifyAdminAccessUseCase } from "./verify-admin-access.use-case.js";

vi.mock("../repositories/user.repository.js");

describe("verifyAdminAccessUseCase", () => {
  it("returns result from repository", async () => {
    const authContext = { token: "token" };

    adminAccessCheck.mockResolvedValue({ ok: true });

    const result = await verifyAdminAccessUseCase(authContext);

    expect(adminAccessCheck).toHaveBeenCalledWith(authContext);
    expect(result).toEqual({ ok: true });
  });
});

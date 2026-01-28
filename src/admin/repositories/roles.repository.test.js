import { describe, expect, it, vi } from "vitest";

import { findAll } from "./roles.repository.js";

vi.mock("../../common/wreck.js", () => ({
  wreck: {
    get: vi.fn(),
  },
}));

describe("rolesRepository", () => {
  it("fetches roles with bearer token", async () => {
    const { wreck } = await import("../../common/wreck.js");

    wreck.get.mockResolvedValue({
      payload: [{ code: "PMF_READ" }],
    });

    const authContext = { token: "token-123" };

    const result = await findAll(authContext);

    expect(wreck.get).toHaveBeenCalledWith("/roles", {
      headers: {
        authorization: "Bearer token-123",
      },
    });
    expect(result).toEqual([{ code: "PMF_READ" }]);
  });
});

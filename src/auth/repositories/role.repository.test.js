import { beforeEach, describe, expect, it, vi } from "vitest";
import { wreck } from "../../common/wreck.js";
import { getRoles } from "./role.repository.js";

vi.mock("../../common/wreck.js");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getRoles", () => {
  const authContext = { token: "mock-token" };

  it("gets roles", async () => {
    const mockRoles = [
      { code: "ROLE_1", description: "Role 1", assignable: true },
    ];

    wreck.get.mockResolvedValue({
      payload: mockRoles,
    });

    const result = await getRoles(authContext);

    expect(wreck.get).toHaveBeenCalledWith("/roles", {
      headers: {
        authorization: `Bearer ${authContext.token}`,
      },
    });
    expect(result).toEqual(mockRoles);
  });
});

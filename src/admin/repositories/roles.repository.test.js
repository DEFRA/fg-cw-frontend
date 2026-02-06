import { describe, expect, it, vi } from "vitest";
import { create, findAll, findByCode, updateRole } from "./roles.repository.js";

vi.mock("../../common/wreck.js", () => ({
  wreck: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
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

  it("fetches a role by code", async () => {
    const { wreck } = await import("../../common/wreck.js");

    wreck.get.mockResolvedValue({
      payload: { code: "PMF_READ" },
    });

    const authContext = { token: "token-123" };

    const result = await findByCode(authContext, "PMF_READ");

    expect(wreck.get).toHaveBeenCalledWith("/roles/PMF_READ", {
      headers: {
        authorization: "Bearer token-123",
      },
    });
    expect(result).toEqual({ code: "PMF_READ" });
  });

  it("updates a role", async () => {
    const { wreck } = await import("../../common/wreck.js");

    wreck.put.mockResolvedValue({
      payload: { code: "PMF_READ" },
    });

    const authContext = { token: "token-123" };

    const result = await updateRole(authContext, "PMF_READ", {
      description: "Read only",
      assignable: true,
    });

    expect(wreck.put).toHaveBeenCalledWith("/roles/PMF_READ", {
      headers: {
        authorization: "Bearer token-123",
      },
      payload: {
        description: "Read only",
        assignable: true,
      },
    });
    expect(result).toEqual({ code: "PMF_READ" });
  });

  it("creates role with bearer token", async () => {
    const { wreck } = await import("../../common/wreck.js");

    wreck.post.mockResolvedValue({ payload: undefined });

    const authContext = { token: "token-123" };
    const roleData = {
      code: "ROLE_PMF_READ",
      description: "Pigs might fly read only",
      assignable: true,
    };

    await create(authContext, roleData);

    expect(wreck.post).toHaveBeenCalledWith("/roles", {
      headers: {
        authorization: "Bearer token-123",
      },
      payload: roleData,
    });
  });
});

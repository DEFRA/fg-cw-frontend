import { describe, expect, it, vi } from "vitest";
import { wreck } from "../../common/wreck.js";
import { create, findAll, update } from "./user.repository.js";

vi.mock("../../common/wreck.js");

describe("findAll", () => {
  it("finds users by criteria", async () => {
    const idpId = "testIdpId";

    wreck.get.mockResolvedValue({
      payload: {
        id: "123",
        firstName: "John",
        lastName: "Doe",
        idpId,
      },
    });

    const user = await findAll({ idpId });

    expect(wreck.get).toHaveBeenCalledWith(`/users?idpId=${idpId}`);
    expect(user).toEqual({
      id: "123",
      firstName: "John",
      lastName: "Doe",
      idpId,
    });
  });
});

describe("create", () => {
  it("creates a new user", async () => {
    const userData = {
      firstName: "John",
      lastName: "Doe",
    };

    wreck.post.mockResolvedValue({
      payload: {
        id: "123",
      },
    });

    const result = await create(userData);

    expect(wreck.post).toHaveBeenCalledWith("/users", {
      payload: userData,
    });

    expect(result).toEqual({
      id: "123",
    });
  });
});

describe("update", () => {
  it("updates user's details", async () => {
    const userData = {
      firstName: "Jane",
      lastName: "Doe",
      idpRoles: ["admin"],
      appRoles: ["user"],
    };

    await update("123", userData);

    expect(wreck.patch).toHaveBeenCalledWith("/users/123", {
      payload: userData,
    });
  });
});

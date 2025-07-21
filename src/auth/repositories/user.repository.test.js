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

  it("finds users by allAppRoles", async () => {
    const idpId = "testIdpId";
    const allAppRoles = ["ROLE_ADMIN", "ROLE_MANAGER"];

    wreck.get.mockResolvedValue({
      payload: [
        {
          idpId,
          appRoles: ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_USER"],
        },
      ],
    });

    const users = await findAll({ idpId, allAppRoles });

    expect(wreck.get).toHaveBeenCalledWith(
      `/users?idpId=${idpId}&allAppRoles=ROLE_ADMIN&allAppRoles=ROLE_MANAGER`,
    );
    expect(users).toEqual([
      {
        idpId,
        appRoles: ["ROLE_ADMIN", "ROLE_MANAGER", "ROLE_USER"],
      },
    ]);
  });

  it("finds users by anyAppRoles", async () => {
    const idpId = "testIdpId";
    const anyAppRoles = ["ROLE_REVIEWER", "ROLE_APPROVER"];

    wreck.get.mockResolvedValue({
      payload: [
        {
          idpId,
          appRoles: ["ROLE_REVIEWER"],
        },
      ],
    });

    const users = await findAll({ idpId, anyAppRoles });

    expect(wreck.get).toHaveBeenCalledWith(
      `/users?idpId=${idpId}&anyAppRoles=ROLE_REVIEWER&anyAppRoles=ROLE_APPROVER`,
    );
    expect(users).toEqual([
      {
        idpId,
        appRoles: ["ROLE_REVIEWER"],
      },
    ]);
  });

  it("finds users by allAppRoles and anyAppRoles", async () => {
    const idpId = "testIdpId";
    const allAppRoles = ["ROLE_ADMIN", "ROLE_APPROVER"];
    const anyAppRoles = ["ROLE_REVIEWER"];

    wreck.get.mockResolvedValue({
      payload: [
        {
          idpId,
          appRoles: ["ROLE_ADMIN", "ROLE_APPROVER", "ROLE_REVIEWER"],
        },
      ],
    });

    const users = await findAll({ idpId, allAppRoles, anyAppRoles });

    expect(wreck.get).toHaveBeenCalledWith(
      `/users?idpId=${idpId}&allAppRoles=ROLE_ADMIN&allAppRoles=ROLE_APPROVER&anyAppRoles=ROLE_REVIEWER`,
    );
    expect(users).toEqual([
      {
        idpId,
        appRoles: ["ROLE_ADMIN", "ROLE_APPROVER", "ROLE_REVIEWER"],
      },
    ]);
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
    const updatedUserData = {
      id: "123",
      name: "Bob Bill",
      idpRoles: ["ROLE_ADMIN"],
      appRoles: ["ROLE_USER"],
    };

    wreck.patch.mockResolvedValue({
      payload: updatedUserData,
    });

    const userData = {
      name: "Bob Bill",
      idpRoles: ["ROLE_ADMIN"],
      appRoles: ["ROLE_USER"],
    };

    const user = await update("123", userData);

    expect(wreck.patch).toHaveBeenCalledWith("/users/123", {
      payload: userData,
    });

    expect(user).toEqual(updatedUserData);
  });
});

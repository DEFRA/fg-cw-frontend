import { describe, expect, it, vi } from "vitest";
import { wreck } from "../../common/wreck.js";
import { create, findAll, recordLogin, update } from "./user.repository.js";

vi.mock("../../common/wreck.js");

describe("findAll", () => {
  const authContext = { token: "mock-token" };

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

    const user = await findAll(authContext, { idpId });

    expect(wreck.get).toHaveBeenCalledWith(`/users?idpId=${idpId}`, {
      headers: {
        authorization: `Bearer ${authContext.token}`,
      },
    });
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

    const users = await findAll(authContext, { idpId, allAppRoles });

    expect(wreck.get).toHaveBeenCalledWith(
      `/users?idpId=${idpId}&allAppRoles=ROLE_ADMIN&allAppRoles=ROLE_MANAGER`,
      {
        headers: {
          authorization: `Bearer ${authContext.token}`,
        },
      },
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

    const users = await findAll(authContext, { idpId, anyAppRoles });

    expect(wreck.get).toHaveBeenCalledWith(
      `/users?idpId=${idpId}&anyAppRoles=ROLE_REVIEWER&anyAppRoles=ROLE_APPROVER`,
      {
        headers: {
          authorization: `Bearer ${authContext.token}`,
        },
      },
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

    const users = await findAll(authContext, {
      idpId,
      allAppRoles,
      anyAppRoles,
    });

    expect(wreck.get).toHaveBeenCalledWith(
      `/users?idpId=${idpId}&allAppRoles=ROLE_ADMIN&allAppRoles=ROLE_APPROVER&anyAppRoles=ROLE_REVIEWER`,
      {
        headers: {
          authorization: `Bearer ${authContext.token}`,
        },
      },
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
  const authContext = { token: "mock-token" };

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

    const result = await create(authContext, userData);

    expect(wreck.post).toHaveBeenCalledWith("/users", {
      headers: {
        authorization: `Bearer ${authContext.token}`,
      },
      payload: userData,
    });

    expect(result).toEqual({
      id: "123",
    });
  });
});

describe("update", () => {
  const authContext = { token: "mock-token" };

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

    const user = await update(authContext, "123", userData);

    expect(wreck.patch).toHaveBeenCalledWith("/users/123", {
      headers: {
        authorization: `Bearer ${authContext.token}`,
      },
      payload: userData,
    });

    expect(user).toEqual(updatedUserData);
  });
});

describe("recordLogin", () => {
  const authContext = { token: "mock-token" };

  it("records login for a user", async () => {
    wreck.post.mockResolvedValue({
      payload: undefined,
    });

    await recordLogin(authContext, "123", {
      name: "Bob Bill",
      idpRoles: [],
    });

    expect(wreck.post).toHaveBeenCalledWith("/users/123/login", {
      headers: {
        authorization: `Bearer ${authContext.token}`,
      },
      payload: {
        name: "Bob Bill",
        idpRoles: [],
      },
    });
  });
});

import { describe, expect, it, vi } from "vitest";
import { wreck } from "../../common/wreck.js";
import { create, findAll, update, updateLastLogin } from "./user.repository.js";

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

describe("updateLastLogin", () => {
  const authContext = { token: "mock-token" };

  it("updates user last login timestamp", async () => {
    const userId = "69691417bd385df3ac6aa25f";

    const responseUser = {
      id: userId,
      idpId: "12345678-1234-1234-1234-123456789012",
      email: "john.doe@defra.gov.uk",
      name: "John Doe",
      idpRoles: ["FCP.Casework.ReadWrite"],
      appRoles: {},
      createdAt: "2026-01-15T16:21:43.468Z",
      updatedAt: "2026-01-15T16:22:26.942Z",
      lastLoginAt: "2026-01-15T16:22:26.942Z",
    };

    wreck.post.mockResolvedValue({
      payload: responseUser,
    });

    const user = await updateLastLogin(authContext, userId);

    expect(wreck.post).toHaveBeenCalledWith(`/users/${userId}/login`, {
      headers: {
        authorization: `Bearer ${authContext.token}`,
      },
    });

    expect(user).toEqual(responseUser);
  });
});

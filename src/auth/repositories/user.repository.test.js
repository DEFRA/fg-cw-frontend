import { describe, expect, it, vi } from "vitest";
import { wreck } from "../../common/wreck.js";
import {
  create,
  findAdminUsers,
  findAll,
  findAssignees,
  update,
} from "./user.repository.js";

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

describe("findAdminUsers", () => {
  const authContext = { token: "mock-token" };

  it("finds admin users by criteria", async () => {
    const idpId = "testIdpId";

    wreck.get.mockResolvedValue({
      payload: [{ idpId }],
    });

    const users = await findAdminUsers(authContext, { idpId });

    expect(wreck.get).toHaveBeenCalledWith(`/admin/users?idpId=${idpId}`, {
      headers: {
        authorization: `Bearer ${authContext.token}`,
      },
    });
    expect(users).toEqual([{ idpId }]);
  });
});

describe("findAssignees", () => {
  const authContext = { token: "mock-token" };

  it("finds assignees by role criteria", async () => {
    const allAppRoles = ["ROLE_ADMIN"];
    const anyAppRoles = ["ROLE_REVIEWER", "ROLE_APPROVER"];

    wreck.get.mockResolvedValue({
      payload: [{ id: "user-1", name: "Alice" }],
    });

    const assignees = await findAssignees(authContext, {
      allAppRoles,
      anyAppRoles,
    });

    expect(wreck.get).toHaveBeenCalledWith(
      "/users/assignees?allAppRoles=ROLE_ADMIN&anyAppRoles=ROLE_REVIEWER&anyAppRoles=ROLE_APPROVER",
      {
        headers: {
          authorization: `Bearer ${authContext.token}`,
        },
      },
    );
    expect(assignees).toEqual([{ id: "user-1", name: "Alice" }]);
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

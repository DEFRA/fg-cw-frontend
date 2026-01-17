import { describe, expect, it, vi } from "vitest";
import { wreck } from "../../common/wreck.js";
import { findAll, login } from "./user.repository.js";

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

describe("login", () => {
  const authContext = { token: "mock-token" };

  it("creates or updates user and records login", async () => {
    const userData = {
      idpId: "12345678-1234-1234-1234-123456789012",
      name: "John Doe",
      email: "john.doe@defra.gov.uk",
      idpRoles: ["FCP.Casework.ReadWrite"],
      appRoles: {},
    };

    const responseUser = {
      id: "69691417bd385df3ac6aa25f",
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

    const user = await login(authContext, userData);

    expect(wreck.post).toHaveBeenCalledWith("/users/login", {
      headers: {
        authorization: `Bearer ${authContext.token}`,
      },
      payload: userData,
    });

    expect(user).toEqual(responseUser);
  });

  it("handles user login with appRoles", async () => {
    const userData = {
      idpId: "12345678-1234-1234-1234-123456789012",
      name: "John Doe",
      email: "john.doe@defra.gov.uk",
      idpRoles: ["FCP.Casework.ReadWrite"],
      appRoles: {
        ROLE_ADMIN: {
          name: "ROLE_ADMIN",
          startDate: "2025-01-01",
          endDate: "2100-01-01",
        },
      },
    };

    const responseUser = {
      id: "69691417bd385df3ac6aa25f",
      ...userData,
      createdAt: "2026-01-15T16:21:43.468Z",
      updatedAt: "2026-01-15T16:22:26.942Z",
      lastLoginAt: "2026-01-15T16:22:26.942Z",
    };

    wreck.post.mockResolvedValue({
      payload: responseUser,
    });

    const user = await login(authContext, userData);

    expect(wreck.post).toHaveBeenCalledWith("/users/login", {
      headers: {
        authorization: `Bearer ${authContext.token}`,
      },
      payload: userData,
    });

    expect(user).toEqual(responseUser);
  });
});

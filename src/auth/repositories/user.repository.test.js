import { beforeEach, describe, expect, it, vi } from "vitest";
import { wreck } from "../../common/wreck.js";
import {
  adminAccessCheck,
  adminFindUsers,
  findAssignees,
  login,
} from "./user.repository.js";

vi.mock("../../common/wreck.js");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("adminAccessCheck", () => {
  const authContext = { token: "mock-token" };

  it("checks admin access", async () => {
    wreck.get.mockResolvedValue({
      payload: { ok: true },
    });

    const result = await adminAccessCheck(authContext);

    expect(wreck.get).toHaveBeenCalledWith("/admin/access-check", {
      headers: {
        authorization: `Bearer ${authContext.token}`,
      },
    });
    expect(result).toEqual({ ok: true });
  });
});

describe("adminFindUsers", () => {
  const authContext = { token: "mock-token" };

  it("finds admin users by criteria", async () => {
    const idpId = "testIdpId";

    wreck.get.mockResolvedValue({
      payload: [
        {
          id: "admin-123",
          idpId,
          appRoles: ["ROLE_ADMIN"],
        },
      ],
    });

    const users = await adminFindUsers(authContext, { idpId });

    expect(wreck.get).toHaveBeenCalledWith(`/admin/users?idpId=${idpId}`, {
      headers: {
        authorization: `Bearer ${authContext.token}`,
      },
    });
    expect(users).toEqual([
      {
        id: "admin-123",
        idpId,
        appRoles: ["ROLE_ADMIN"],
      },
    ]);
  });

  it("finds admin users by role filters", async () => {
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

    const users = await adminFindUsers(authContext, {
      idpId,
      allAppRoles,
      anyAppRoles,
    });

    expect(wreck.get).toHaveBeenCalledWith(
      `/admin/users?idpId=${idpId}&allAppRoles=ROLE_ADMIN&allAppRoles=ROLE_APPROVER&anyAppRoles=ROLE_REVIEWER`,
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

describe("findAssignees", () => {
  const authContext = { token: "mock-token" };

  it("finds assignees with no filters", async () => {
    wreck.get.mockResolvedValue({
      payload: [],
    });

    const users = await findAssignees(authContext, {});

    expect(wreck.get).toHaveBeenCalledWith(`/users/assignees?`, {
      headers: {
        authorization: `Bearer ${authContext.token}`,
      },
    });
    expect(users).toEqual([]);
  });

  it("finds assignees by role filters", async () => {
    const allAppRoles = ["ROLE_CASEWORKER"];
    const anyAppRoles = ["ROLE_REVIEWER", "ROLE_APPROVER"];

    wreck.get.mockResolvedValue({
      payload: [
        {
          id: "assignee-1",
          appRoles: ["ROLE_CASEWORKER"],
        },
      ],
    });

    const users = await findAssignees(authContext, {
      allAppRoles,
      anyAppRoles,
    });

    expect(wreck.get).toHaveBeenCalledWith(
      `/users/assignees?allAppRoles=ROLE_CASEWORKER&anyAppRoles=ROLE_REVIEWER&anyAppRoles=ROLE_APPROVER`,
      {
        headers: {
          authorization: `Bearer ${authContext.token}`,
        },
      },
    );
    expect(users).toEqual([
      {
        id: "assignee-1",
        appRoles: ["ROLE_CASEWORKER"],
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

  it("receives appRoles from backend even when not sent", async () => {
    const userData = {
      idpId: "12345678-1234-1234-1234-123456789012",
      name: "John Doe",
      email: "john.doe@defra.gov.uk",
      idpRoles: ["FCP.Casework.ReadWrite"],
    };

    const responseUser = {
      id: "69691417bd385df3ac6aa25f",
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

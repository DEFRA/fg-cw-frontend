import { describe, expect, it, vi } from "vitest";
import { login } from "../repositories/user.repository.js";
import { loginUserUseCase } from "./login-user.use-case.js";

vi.mock("../repositories/user.repository.js");

describe("loginUserUseCase", () => {
  const authContext = {
    token: "mock-token",
    profile: {
      oid: "12345678-1234-1234-1234-123456789012",
      name: "Bob Bill",
      email: "bob.bill@defra.gov.uk",
      roles: ["FCP.Casework.ReadWrite"],
    },
  };

  it("calls login with correct user data", async () => {
    const mockUser = {
      id: "69691417bd385df3ac6aa25f",
      idpId: "12345678-1234-1234-1234-123456789012",
      email: "bob.bill@defra.gov.uk",
      name: "Bob Bill",
      idpRoles: ["FCP.Casework.ReadWrite"],
      appRoles: {},
      createdAt: "2026-01-15T16:21:43.468Z",
      updatedAt: "2026-01-15T16:22:26.942Z",
      lastLoginAt: "2026-01-15T16:22:26.942Z",
    };

    login.mockResolvedValue(mockUser);

    const result = await loginUserUseCase(authContext);

    expect(login).toHaveBeenCalledWith(authContext, {
      idpId: authContext.profile.oid,
      name: authContext.profile.name,
      email: authContext.profile.email,
      idpRoles: authContext.profile.roles,
    });

    expect(result).toEqual(mockUser);
  });

  it("throws error when user has no roles", async () => {
    const authContextNoRoles = {
      token: "mock-token",
      profile: {
        oid: "12345678-1234-1234-1234-123456789012",
        name: "Bob Bill",
        email: "bob.bill@defra.gov.uk",
        // no roles
      },
    };

    await expect(loginUserUseCase(authContextNoRoles)).rejects.toThrow(
      "User with IDP id '12345678-1234-1234-1234-123456789012' has no 'roles'",
    );

    expect(login).not.toHaveBeenCalled();
  });

  it("returns user with lastLoginAt timestamp", async () => {
    const mockUser = {
      id: "69691417bd385df3ac6aa25f",
      idpId: "12345678-1234-1234-1234-123456789012",
      email: "bob.bill@defra.gov.uk",
      name: "Bob Bill",
      idpRoles: ["FCP.Casework.ReadWrite"],
      appRoles: {},
      createdAt: "2026-01-15T16:21:43.468Z",
      updatedAt: "2026-01-15T16:22:26.942Z",
      lastLoginAt: "2026-01-15T16:22:26.942Z",
    };

    login.mockResolvedValue(mockUser);

    const result = await loginUserUseCase(authContext);

    expect(result.lastLoginAt).toBeDefined();
    expect(result.updatedAt).toBeDefined();
  });
});

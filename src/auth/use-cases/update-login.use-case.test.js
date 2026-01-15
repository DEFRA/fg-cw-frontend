import { describe, expect, it, vi } from "vitest";
import { findAll, updateLastLogin } from "../repositories/user.repository.js";
import { updateLoginUseCase } from "./update-login.use-case.js";

vi.mock("../repositories/user.repository.js");

describe("updateLoginUseCase", () => {
  it("finds user by idpId and updates last login timestamp", async () => {
    const authContext = {
      profile: {
        oid: "12345678-1234-1234-1234-123456789012",
        email: "bob.bill@defra.gov.uk",
        name: "Bob Bill",
        roles: ["FCP.Casework.ReadWrite"],
      },
    };

    const existingUser = {
      id: "69691417bd385df3ac6aa25f",
      idpId: "12345678-1234-1234-1234-123456789012",
      email: "bob.bill@defra.gov.uk",
      name: "Bob Bill",
      idpRoles: ["FCP.Casework.ReadWrite"],
    };

    findAll.mockResolvedValue([existingUser]);
    updateLastLogin.mockResolvedValue();

    await updateLoginUseCase(authContext);

    expect(findAll).toHaveBeenCalledWith(authContext, {
      idpId: "12345678-1234-1234-1234-123456789012",
    });

    expect(updateLastLogin).toHaveBeenCalledWith(
      authContext,
      "69691417bd385df3ac6aa25f",
    );
  });

  it("throws Boom.badRequest when roles not supplied", async () => {
    const authContext = {
      profile: {
        oid: "12345678-1234-1234-1234-123456789012",
        email: "bob.bill@defra.gov.uk",
        name: "Bob Bill",
      },
    };

    await expect(() => updateLoginUseCase(authContext)).rejects.toThrow(
      "User with IDP id '12345678-1234-1234-1234-123456789012' has no 'roles'",
    );

    expect(findAll).not.toHaveBeenCalled();
    expect(updateLastLogin).not.toHaveBeenCalled();
  });

  it("throws Boom.notFound when user does not exist", async () => {
    const authContext = {
      profile: {
        oid: "12345678-1234-1234-1234-123456789012",
        email: "bob.bill@defra.gov.uk",
        name: "Bob Bill",
        roles: ["FCP.Casework.ReadWrite"],
      },
    };

    findAll.mockResolvedValue([]);

    await expect(() => updateLoginUseCase(authContext)).rejects.toThrow(
      "User with IDP id '12345678-1234-1234-1234-123456789012' not found",
    );

    expect(findAll).toHaveBeenCalledWith(authContext, {
      idpId: "12345678-1234-1234-1234-123456789012",
    });

    expect(updateLastLogin).not.toHaveBeenCalled();
  });
});

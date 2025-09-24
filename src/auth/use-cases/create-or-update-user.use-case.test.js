import { describe, expect, it, vi } from "vitest";
import { create, findAll, update } from "../repositories/user.repository.js";
import { createOrUpdateUserUseCase } from "./create-or-update-user.use-case.js";

vi.mock("../repositories/user.repository.js");

describe("createOrUpdateUserUseCase", () => {
  it("creates a user when one does not exist", async () => {
    findAll.mockResolvedValue([]);

    await createOrUpdateUserUseCase({
      oid: "12345678-1234-1234-1234-123456789012",
      email: "bob.bill@defra.gov.uk",
      name: "Bob Bill",
      roles: ["FCP.Casework.Read"],
    });

    expect(findAll).toHaveBeenCalledWith({
      idpId: "12345678-1234-1234-1234-123456789012",
    });

    expect(create).toHaveBeenCalledWith({
      email: "bob.bill@defra.gov.uk",
      name: "Bob Bill",
      idpId: "12345678-1234-1234-1234-123456789012",
      idpRoles: ["FCP.Casework.Read"],
      appRoles: {},
    });
    expect(update).not.toHaveBeenCalled();
  });

  it("updates a user when one exists", async () => {
    const existingUser = {
      id: "123",
      idpId: "12345678-1234-1234-1234-123456789012",
      name: "Bob Bill",
      email: "bob.bill@defra.gov.uk",
    };

    findAll.mockResolvedValue([existingUser]);

    await createOrUpdateUserUseCase({
      oid: "12345678-1234-1234-1234-123456789012",
      email: "bob.bill@defra.gov.uk",
      name: "Bob Bill",
      roles: ["FCP.Casework.Read"],
    });

    expect(findAll).toHaveBeenCalledWith({
      idpId: "12345678-1234-1234-1234-123456789012",
    });

    expect(update).toHaveBeenCalledWith(existingUser.id, {
      name: "Bob Bill",
      idpRoles: ["FCP.Casework.Read"],
    });

    expect(create).not.toHaveBeenCalled();
  });

  it("throws Boom.badRequest when roles not supplied", async () => {
    await expect(() =>
      createOrUpdateUserUseCase({
        oid: "12345678-1234-1234-1234-123456789012",
        email: "bob.bill@defra.gov.uk",
        name: "Bob Bill",
      }),
    ).rejects.toThrow(
      "User with IDP id '12345678-1234-1234-1234-123456789012' has no 'roles'",
    );

    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});

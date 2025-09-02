import { describe, expect, it, vi } from "vitest";
import { create, findAll, update } from "../repositories/user.repository.js";
import { createOrUpdateUserUseCase } from "./create-or-update-user.use-case.js";

vi.mock("../repositories/user.repository.js");

describe("createOrUpdateUserUseCase", () => {
  it("creates a user when one does not exist", async () => {
    findAll.mockResolvedValue([]);

    await createOrUpdateUserUseCase({
      oid: "12345678-1234-1234-1234-123456789012",
      email: "casey.test@example.test",
      name: "Casey Test",
      roles: ["FCP.Casework.Read"],
    });

    expect(findAll).toHaveBeenCalledWith({
      idpId: "12345678-1234-1234-1234-123456789012",
    });

    expect(create).toHaveBeenCalledWith({
      email: "casey.test@example.test",
      name: "Casey Test",
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
      name: "Casey Test",
      email: "casey.test@example.test",
    };

    findAll.mockResolvedValue([existingUser]);

    await createOrUpdateUserUseCase({
      oid: "12345678-1234-1234-1234-123456789012",
      email: "casey.test@example.test",
      name: "Casey Test",
      roles: ["FCP.Casework.Read"],
    });

    expect(findAll).toHaveBeenCalledWith({
      idpId: "12345678-1234-1234-1234-123456789012",
    });

    expect(update).toHaveBeenCalledWith(existingUser.id, {
      name: "Casey Test",
      idpRoles: ["FCP.Casework.Read"],
    });

    expect(create).not.toHaveBeenCalled();
  });

  it("throws Boom.badRequest when roles not supplied", async () => {
    await expect(() =>
      createOrUpdateUserUseCase({
        oid: "12345678-1234-1234-1234-123456789012",
        email: "casey.test@example.test",
        name: "Casey Test",
      }),
    ).rejects.toThrow(
      "User with IDP id '12345678-1234-1234-1234-123456789012' has no 'roles'",
    );

    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});

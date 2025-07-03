import Boom from "@hapi/boom";
import { create, findAll, update } from "../repositories/user.repository.js";

const validRoles = [
  "FCP.Casework.Read",
  "FCP.Casework.ReadWrite",
  "FCP.Casework.Admin",
];

const getValidRoles = (tokenRoles) => {
  const validRoleSet = new Set(validRoles);
  const tokenRoleSet = new Set(tokenRoles);
  const intersection = validRoleSet.intersection(tokenRoleSet);
  return Array.from(intersection);
};

export const createOrUpdateUserUseCase = async ({ idToken, email }) => {
  if (!idToken.roles) {
    throw Boom.badRequest(
      `User with IDP id '${idToken.oid}' has no 'roles' claim in ID token`,
    );
  }

  const idpRoles = getValidRoles(idToken.roles);

  if (idpRoles.length === 0) {
    throw Boom.unauthorized(
      `User with IDP id '${idToken.oid}' has not been assigned a valid role. Expected one of [${validRoles.join(", ")}], got [${idToken.roles.join(", ")}]`,
    );
  }

  const idpId = idToken.oid;

  const [existingUser] = await findAll({
    idpId,
  });

  if (existingUser) {
    await update(existingUser.id, {
      idpRoles,
      name: idToken.name,
    });

    return;
  }

  await create({
    email,
    idpId,
    idpRoles,
    appRoles: [],
    name: idToken.name,
  });
};

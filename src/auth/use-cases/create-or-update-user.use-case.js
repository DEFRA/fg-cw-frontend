import Boom from "@hapi/boom";
import { create, findAll, update } from "../repositories/user.repository.js";

export const createOrUpdateUserUseCase = async (profile) => {
  if (!profile.roles) {
    throw Boom.badRequest(`User with IDP id '${profile.oid}' has no 'roles'`);
  }

  const [existingUser] = await findAll({
    idpId: profile.oid,
  });

  if (existingUser) {
    return await update(existingUser.id, {
      name: profile.name,
      idpRoles: profile.roles,
    });
  }

  return await create({
    idpId: profile.oid,
    name: profile.name,
    email: profile.email,
    idpRoles: profile.roles,
    appRoles: [],
  });
};

import Boom from "@hapi/boom";
import { create, findAll, update } from "../repositories/user.repository.js";
import { logger } from "../../common/logger.js";

export const createOrUpdateUserUseCase = async (authContext) => {
  logger.info("createOrUpdateUserUseCase invoked");
  const { profile } = authContext;

  if (!profile.roles) {
    throw Boom.badRequest(`User with IDP id '${profile.oid}' has no 'roles'`);
  }

  const [existingUser] = await findAll(authContext, {
    idpId: profile.oid,
  });

  if (existingUser) {
    return await update(authContext, existingUser.id, {
      name: profile.name,
      idpRoles: profile.roles,
    });
  }

  logger.info("Finished: createOrUpdateUserUseCase invoked");

  return await create(authContext, {
    idpId: profile.oid,
    name: profile.name,
    email: profile.email,
    idpRoles: profile.roles,
    appRoles: {},
  });
};

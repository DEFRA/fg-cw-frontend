import Boom from "@hapi/boom";
import { logger } from "../../common/logger.js";
import { create, findAll, update } from "../repositories/user.repository.js";

export const createOrUpdateUserUseCase = async (authContext) => {
  logger.info(
    `Create or update user use case invoked for user ${authContext.profile.oid}`,
  );
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

  logger.info(
    `Finished: Create or update user use case invoked for user ${authContext.profile.oid}`,
  );

  return await create(authContext, {
    idpId: profile.oid,
    name: profile.name,
    email: profile.email,
    idpRoles: profile.roles,
    appRoles: {},
  });
};

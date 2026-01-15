import Boom from "@hapi/boom";
import { logger } from "../../common/logger.js";
import { findAll, updateLastLogin } from "../repositories/user.repository.js";

export const updateLoginUseCase = async (authContext) => {
  logger.info(
    `Update login use case invoked for user ${authContext.profile.oid}`,
  );
  const { profile } = authContext;

  if (!profile.roles) {
    throw Boom.badRequest(`User with IDP id '${profile.oid}' has no 'roles'`);
  }
  // find the user by idpId so we can update the lastLoginAt field
  const [existingUser] = await findAll(authContext, {
    idpId: profile.oid,
  });

  if (!existingUser) {
    throw Boom.notFound(`User with IDP id '${profile.oid}' not found`);
  }

  await updateLastLogin(authContext, existingUser.id);

  logger.info(
    `Finished: Update login use case invoked for user ${authContext.profile.oid}`,
  );
};

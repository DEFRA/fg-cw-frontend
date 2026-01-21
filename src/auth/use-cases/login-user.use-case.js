import Boom from "@hapi/boom";
import { logger } from "../../common/logger.js";
import { login } from "../repositories/user.repository.js";

export const loginUserUseCase = async (authContext) => {
  logger.info(
    `Login user use case invoked for user ${authContext.profile.oid}`,
  );
  const { profile } = authContext;

  if (!profile.roles) {
    throw Boom.badRequest(`User with IDP id '${profile.oid}' has no 'roles'`);
  }

  const user = await login(authContext, {
    idpId: profile.oid,
    name: profile.name,
    email: profile.email,
    idpRoles: profile.roles,
  });

  logger.info(
    `Finished: Login user use case invoked for user ${authContext.profile.oid}`,
  );

  return user;
};

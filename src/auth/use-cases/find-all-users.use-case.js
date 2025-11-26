import { findAll } from "../repositories/user.repository.js";
import { logger } from "../../common/logger.js";

export const findAllUsersUseCase = async (authContext, query) => {
  logger.debug("Finding all users");
  const users = await findAll(authContext, query);
  logger.debug("Finished finding all users");
  return users;
};

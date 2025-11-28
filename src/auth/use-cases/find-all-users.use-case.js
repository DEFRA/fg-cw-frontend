import { findAll } from "../repositories/user.repository.js";
import { logger } from "../../common/logger.js";

export const findAllUsersUseCase = async (authContext, query) => {
  logger.info("Finding all users");
  const users = await findAll(authContext, query);
  logger.info("Finished finding all users");
  return users;
};

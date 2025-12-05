import { logger } from "../../common/logger.js";
import { findAll } from "../repositories/user.repository.js";

export const findAllUsersUseCase = async (authContext, query) => {
  logger.info("Finding all users");
  const users = await findAll(authContext, query);
  logger.info("Finished: Finding all users");
  return users;
};

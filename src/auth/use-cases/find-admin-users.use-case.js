import { logger } from "../../common/logger.js";
import { findAdminUsers } from "../repositories/user.repository.js";

export const findAdminUsersUseCase = async (authContext, query) => {
  logger.info("Finding admin users");
  const users = await findAdminUsers(authContext, query);
  logger.info("Finished: Finding admin users");
  return users;
};

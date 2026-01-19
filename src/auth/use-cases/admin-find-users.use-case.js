import { logger } from "../../common/logger.js";
import { adminFindUsers } from "../repositories/user.repository.js";

export const adminFindUsersUseCase = async (authContext, query) => {
  logger.info("Finding admin users");
  const users = await adminFindUsers(authContext, query);
  logger.info("Finished: Finding admin users");
  return users;
};

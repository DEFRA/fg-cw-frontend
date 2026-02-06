import { logger } from "../../common/logger.js";
import { adminCreateUser } from "../repositories/user.repository.js";

export const adminCreateUserUseCase = async (authContext, { name, email }) => {
  logger.info("Creating user manually");
  const user = await adminCreateUser(authContext, { name, email });
  logger.info("Finished: Creating user manually");
  return user;
};

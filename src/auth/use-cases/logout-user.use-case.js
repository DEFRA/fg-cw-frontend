import { logger } from "../../common/logger.js";
import { logout } from "../repositories/user.repository.js";

export const logoutUserUseCase = async (authContext, { userId }) => {
  logger.info(`Logout user use case invoked for user ${userId}`);

  await logout(authContext, { userId });

  logger.info(`Finished: Logout user use case invoked for user ${userId}`);
};

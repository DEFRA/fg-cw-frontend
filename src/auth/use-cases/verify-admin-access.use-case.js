import { logger } from "../../common/logger.js";
import { adminAccessCheck } from "../repositories/user.repository.js";

export const verifyAdminAccessUseCase = async (authContext) => {
  logger.info("Verifying admin access");
  const result = await adminAccessCheck(authContext);
  logger.info("Finished: Verifying admin access");
  return result;
};

import { logger } from "../../common/logger.js";
import { getRoles } from "../repositories/role.repository.js";

export const getRolesUseCase = async (authContext) => {
  logger.info("Getting roles");
  const roles = await getRoles(authContext);
  logger.info("Finished: Getting roles");
  return roles;
};

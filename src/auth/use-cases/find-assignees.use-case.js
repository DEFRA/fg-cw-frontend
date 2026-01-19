import { logger } from "../../common/logger.js";
import { findAssignees } from "../repositories/user.repository.js";

export const findAssigneesUseCase = async (authContext, query) => {
  logger.info("Finding assignees");
  const users = await findAssignees(authContext, query);
  logger.info("Finished: Finding assignees");
  return users;
};

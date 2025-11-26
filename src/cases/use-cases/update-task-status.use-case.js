import { updateTaskStatus } from "../repositories/case.repository.js";
import { logger } from "../../common/logger.js";

export const updateTaskStatusUseCase = async (authContext, taskDetails) => {
  logger.debug(`Updating task status for case ${taskDetails}`);
  return updateTaskStatus(authContext, taskDetails);
};

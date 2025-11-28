import { logger } from "../../common/logger.js";
import { updateTaskStatus } from "../repositories/case.repository.js";

// eslint-disable-next-line complexity
export const updateTaskStatusUseCase = async (authContext, taskDetails) => {
  logger.info(
    `Updating task status${taskDetails?.caseId ? ` for case ${taskDetails.caseId}` : ""}${taskDetails?.taskCode ? ` with ${taskDetails.taskCode}` : ""}`,
  );
  const result = updateTaskStatus(authContext, taskDetails);
  logger.info(
    `Finished: Updating task status${taskDetails?.caseId ? ` for case ${taskDetails.caseId}` : ""}${taskDetails?.taskCode ? ` with ${taskDetails.taskCode}` : ""}`,
  );
  return result;
};

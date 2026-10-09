import { logger } from "../../common/logger.js";
import { updateTaskStatus } from "../repositories/case.repository.js";

const forCase = (caseId) => (caseId ? " for case " + caseId : "");
const withTask = (taskCode) => (taskCode ? " with " + taskCode : "");
const describeTask = (taskDetails) =>
  forCase(taskDetails?.caseId) + withTask(taskDetails?.taskCode);

export const updateTaskStatusUseCase = async (authContext, taskDetails) => {
  logger.info("Updating task status" + describeTask(taskDetails));
  const result = updateTaskStatus(authContext, taskDetails);
  logger.info("Finished: Updating task status" + describeTask(taskDetails));
  return result;
};

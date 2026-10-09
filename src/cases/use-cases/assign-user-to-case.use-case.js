import { logger } from "../../common/logger.js";
import { assignUserToCase } from "../repositories/case.repository.js";

export const assignUserToCaseUseCase = async (authContext, data) => {
  logger.info(`Assigning user ${data.assignedUserId} to case ${data.caseId}`);

  if (data.assignedUserId === "") {
    data.assignedUserId = null;
  }

  const result = await assignUserToCase(authContext, data);
  logger.info(
    `Finished: Assigning user ${data.assignedUserId} to case ${data.caseId}`,
  );
  return result;
};

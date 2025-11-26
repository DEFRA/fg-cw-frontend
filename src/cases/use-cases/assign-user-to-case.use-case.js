import { logger } from "../../common/logger.js";
import { assignUserToCase } from "../repositories/case.repository.js";

export const assignUserToCaseUseCase = async (authContext, data) => {
  logger.debug(`Assigning user ${data.assignedUserId} to case ${data.caseId}`);

  if (data.assignedUserId === "") {
    data.assignedUserId = null;
  }

  logger.debug(
    `Finished: Assigning user ${data.assignedUserId} to case ${data.caseId}`,
  );
  return assignUserToCase(authContext, data);
};

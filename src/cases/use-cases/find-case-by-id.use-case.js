import { logger } from "../../common/logger.js";
import { findById } from "../repositories/case.repository.js";

export const findCaseByIdUseCase = async (
  authContext,
  caseId,
  tabId = null,
) => {
  logger.info(`Finding case ${caseId}`);

  const result = findById(authContext, caseId, tabId);

  logger.info(`Finished: Finding case ${caseId}`);

  return result;
};

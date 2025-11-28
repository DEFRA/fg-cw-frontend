import { logger } from "../../common/logger.js";
import { findTabById } from "../repositories/case.repository.js";

export const findCaseTabUseCase = async (
  authContext,
  caseId,
  tabId,
  querystring,
) => {
  logger.info(`Finding tab ${tabId} for case ${caseId}`);
  const result = await findTabById(authContext, caseId, tabId, querystring);
  logger.info(`Finished: Finding tab ${tabId} for case ${caseId}`);
  return result;
};

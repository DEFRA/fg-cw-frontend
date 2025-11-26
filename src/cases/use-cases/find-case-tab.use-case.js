import { findTabById } from "../repositories/case.repository.js";
import { logger } from "../../common/logger.js";

export const findCaseTabUseCase = async (
  authContext,
  caseId,
  tabId,
  querystring,
) => {
  logger.debug(`Finding tab ${tabId} for case ${caseId}`);
  return await findTabById(authContext, caseId, tabId, querystring);
};

import { findTabById } from "../repositories/case.repository.js";

export const findCaseTabUseCase = async (
  authContext,
  caseId,
  tabId,
  querystring,
) => {
  return await findTabById(authContext, caseId, tabId, querystring);
};

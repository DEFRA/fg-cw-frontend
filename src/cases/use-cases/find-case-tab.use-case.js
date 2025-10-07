import { findTabById } from "../repositories/case.repository.js";

export const findCaseTabUseCase = async (authContext, caseId, tabId) => {
  return await findTabById(authContext, caseId, tabId);
};

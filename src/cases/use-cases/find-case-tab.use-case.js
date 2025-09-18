import { findTabById } from "../repositories/case.repository.js";

export const findCaseTabUseCase = async (caseId, tabId) => {
  return await findTabById(caseId, tabId);
};

import { findTabById } from "../repositories/case.repository.js";

export const findCaseTabUseCase = async (caseId, tabId) => {
  const agreementsData = await findTabById(caseId, tabId);
  return agreementsData;
};

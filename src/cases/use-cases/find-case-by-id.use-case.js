import { findById } from "../repositories/case.repository.js";

export const findCaseByIdUseCase = async (
  authContext,
  caseId,
  tabId = null,
) => {
  return findById(authContext, caseId, tabId);
};

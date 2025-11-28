import { findById } from "../repositories/case.repository.js";

export const findCaseByIdUseCase = async (
  authContext,
  caseId,
  tabId = null,
) => {
  return await findById(authContext, caseId, tabId);
};

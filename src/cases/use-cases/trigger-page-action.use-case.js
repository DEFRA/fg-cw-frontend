import * as caseRepository from "../repositories/case.repository.js";

export const triggerPageActionUseCase = async (
  authContext,
  { caseId, actionCode },
) => {
  return caseRepository.triggerPageAction(authContext, {
    caseId,
    actionCode,
  });
};

import { completeStage } from "../repositories/case.repository.js";

export const completeStageUseCase = async (caseId) => {
  return await completeStage(caseId);
};

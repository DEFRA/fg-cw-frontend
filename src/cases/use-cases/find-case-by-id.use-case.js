import { findById } from "../repositories/case.repository.js";

export const findCaseByIdUseCase = async (caseId) => {
  const kase = await findById(caseId);
  return kase;
};

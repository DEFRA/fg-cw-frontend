import { findById } from "../repositories/case.repository.js";

export const findCaseByIdUseCase = async (authContext, caseId) => {
  return await findById(authContext, caseId);
};

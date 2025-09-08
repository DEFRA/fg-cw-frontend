import { findAgreementsById } from "../repositories/case.repository.js";

export const findCaseAgreementsByIdUseCase = async (caseId) => {
  const agreementsData = await findAgreementsById(caseId);
  return agreementsData;
};

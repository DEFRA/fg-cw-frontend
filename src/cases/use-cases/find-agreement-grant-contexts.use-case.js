import { findById } from "../repositories/case.repository.js";

const getAgreements = function (caseDetails) {
  const supplementaryData = caseDetails.supplementaryData || {};
  return supplementaryData.agreements || [];
};

export const findAgreementGrantContextsUseCase = async function (
  authContext,
  caseId,
) {
  const caseDetails = await findById(authContext, caseId);
  if (!caseDetails || !caseDetails.workflowCode) {
    return [];
  }

  return getAgreements(caseDetails)
    .filter(({ agreementRef }) => agreementRef)
    .map(({ agreementRef }) => ({
      agreementRef,
      grantCode: caseDetails.workflowCode,
    }));
};

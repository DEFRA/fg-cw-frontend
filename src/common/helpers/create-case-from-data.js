import { getFormattedGBDate } from './date-helpers.js'

export const createCaseFromData = (caseData) => {
  return {
    id: caseData._id,
    caseRef: caseData.caseRef,
    code: caseData.workflowCode,
    submittedAt: getFormattedGBDate(caseData.payload.submittedAt),
    status: caseData.status,
    sbi: caseData.payload.identifiers?.sbi,
    scheme: caseData.payload.answers?.scheme,
    dateReceived: caseData.dateReceived,
    assignedUser: caseData.assignedUser,
    link: `/cases/${caseData._id}`,
    stages: caseData.stages,
    currentStage: caseData.currentStage
  }
}

import { getFormattedGBDate } from './date-helpers.js'

export const createCaseFromData = (caseData) => {
  return {
    id: caseData._id,
    clientRef: caseData.clientRef,
    workflowCode: caseData.workflowCode,
    submittedAt: getFormattedGBDate(caseData.submittedAt),
    status: caseData.status,
    assignedUser: caseData.assignedUser,
    link: `/case/${caseData._id}`,
    stages: caseData.stages,
    currentStage: caseData.currentStage
  }
}

import { getFormattedGBDate } from '../../common/helpers/date-helpers.js'

// TODO: Add case detail view model - Placeholder for now
export const createCaseDetailViewModel = (caseItem) => {
  // Handle both test data structure and API data structure
  const clientRef = caseItem.clientRef || caseItem.caseRef
  const code = caseItem.code || caseItem.payload?.code || caseItem.workflowCode
  const submittedAt = caseItem.submittedAt || caseItem.payload?.submittedAt

  return {
    pageTitle: `Case ${clientRef}`,
    heading: `Case ${clientRef}`,
    breadcrumbs: [{ text: 'Cases', href: '/cases' }, { text: clientRef }],
    data: {
      case: {
        _id: caseItem._id,
        clientRef: clientRef,
        businessName: caseItem.payload?.answers?.agreementName,
        code: code,
        sbi: caseItem.payload?.identifiers?.sbi,
        scheme: caseItem.payload?.answers?.scheme,
        dateReceived: caseItem.dateReceived,
        submittedAt: getFormattedGBDate(submittedAt),
        status: caseItem.status,
        assignedUser: caseItem.assignedUser,
        stages: caseItem.stages,
        currentStage: caseItem.currentStage,
        payload: caseItem.payload
      }
    }
  }
}

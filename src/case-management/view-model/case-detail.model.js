import { getFormattedGBDate } from '../../common/helpers/date-helpers.js'

// TODO: Add case detail view model - Placeholder for now
export const createCaseDetailViewModel = (caseItem) => {
  return {
    pageTitle: `Case ${caseItem.clientRef}`,
    heading: `Case ${caseItem.clientRef}`,
    breadcrumbs: [],
    data: {
      case: {
        _id: caseItem._id,
        clientRef: caseItem.caseRef,
        businessName: caseItem.payload?.answers?.agreementName,
        code: caseItem.payload?.code,
        sbi: caseItem.payload?.identifiers?.sbi,
        scheme: caseItem.payload?.answers?.scheme,
        dateReceived: caseItem.dateReceived,
        submittedAt: getFormattedGBDate(caseItem.payload?.submittedAt),
        status: caseItem.status,
        assignedUser: caseItem.assignedUser,
        stages: caseItem.stages,
        currentStage: caseItem.currentStage,
        payload: caseItem.payload
      }
    }
  }
}

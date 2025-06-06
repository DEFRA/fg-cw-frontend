// TODO: Add case detail view model - Placeholder for now
export const createCaseDetailViewModel = (caseItem) => {
  return {
    pageTitle: `Case ${caseItem.clientRef}`,
    heading: `Case ${caseItem.clientRef}`,
    breadcrumbs: [
      { text: 'Cases', href: '/cases' },
      { text: caseItem.clientRef }
    ],
    data: {
      case: {
        _id: caseItem._id,
        clientRef: caseItem.clientRef,
        code: caseItem.code,
        submittedDate: caseItem.getFormattedSubmittedDate(),
        status: caseItem.getStatusDisplay(),
        assignedUser: caseItem.getAssignedUserDisplay(),
        stages: caseItem.stages,
        currentStage: caseItem.currentStage
      }
    }
  }
}

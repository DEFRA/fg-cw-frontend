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
        assignedTo: caseItem.getAssignedToDisplay(),
        stages: caseItem.stages,
        currentStage: caseItem.currentStage
      }
    }
  }
}

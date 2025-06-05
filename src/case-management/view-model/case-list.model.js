export const transformCasesForList = (cases) => {
  return {
    allCases: cases.map((caseItem) => ({
      _id: caseItem._id,
      clientRef: caseItem.clientRef,
      code: caseItem.code,
      submittedDate: caseItem.getFormattedSubmittedDate(),
      status: caseItem.getStatusDisplay(),
      assignedTo: caseItem.getAssignedToDisplay(),
      link: `/case/${caseItem._id}`
    }))
  }
}

export const createCaseListViewModel = (cases) => {
  return {
    pageTitle: 'Cases',
    heading: 'Cases',
    breadcrumbs: [],
    data: transformCasesForList(cases)
  }
}

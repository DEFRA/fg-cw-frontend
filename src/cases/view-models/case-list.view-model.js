import { getFormattedGBDate } from "../../common/helpers/date-helpers.js";

export const transformCasesForList = (cases) => {
  return {
    allCases: cases.map((caseItem) => ({
      clientRef: caseItem.payload.clientRef,
      code: caseItem.payload.code,
      submittedAt: getFormattedGBDate(caseItem.payload.submittedAt),
      status: caseItem.status,
      assignedUser: caseItem.assignedUser,
      link: `/cases/${caseItem._id}`,
    })),
  };
};

export const createCaseListViewModel = (cases) => {
  return {
    pageTitle: "Cases",
    heading: "Cases",
    breadcrumbs: [],
    data: transformCasesForList(cases),
  };
};

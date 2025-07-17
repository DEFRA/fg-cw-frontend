import { getFormattedGBDate } from "../../common/helpers/date-helpers.js";

export const transformCasesForList = (cases) => {
  return cases.map((caseItem) => ({
    _id: caseItem._id,
    clientRef: caseItem.payload.clientRef,
    code: caseItem.payload.code,
    submittedAt: getFormattedGBDate(caseItem.payload.submittedAt),
    status: caseItem.status,
    assignedUser: caseItem.assignedUser?.name,
    link: `/cases/${caseItem._id}`,
  }));
};

const createAssignedUserSuccessMessage = (cases, assignedCaseId) => {
  let successMessage = null;

  if (assignedCaseId) {
    const assignedCase = cases.find(
      (caseItem) => caseItem._id === assignedCaseId,
    );

    if (assignedCase && assignedCase.assignedUser) {
      successMessage = {
        heading: "Case assigned successfully",
        caseId: assignedCase._id,
        caseLink: `/cases/${assignedCase._id}`,
        assignedUserName: assignedCase.assignedUser.name,
      };
    }
  }

  return successMessage;
};

export const createCaseListViewModel = (cases, assignedCaseId) => {
  const allCases = transformCasesForList(cases);
  const assignedUserSuccessMessage = createAssignedUserSuccessMessage(
    cases,
    assignedCaseId,
  );

  return {
    pageTitle: "Cases",
    pageHeading: "Cases",
    breadcrumbs: [],
    data: {
      allCases,
      assignedUserSuccessMessage,
    },
  };
};

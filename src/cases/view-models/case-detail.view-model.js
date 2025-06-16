import { getFormattedGBDate } from "../../common/helpers/date-helpers.js";

export const createCaseDetailViewModel = (caseItem) => {
  const caseRef = caseItem.caseRef;
  const code = caseItem.workflowCode;

  return {
    pageTitle: `Case ${caseRef}`,
    heading: `Case ${caseRef}`,
    breadcrumbs: [{ text: "Cases", href: "/cases" }, { text: caseRef }],
    data: {
      case: {
        _id: caseItem._id,
        clientRef: caseRef,
        businessName: caseItem.payload.answers?.agreementName,
        code,
        sbi: caseItem.payload.identifiers?.sbi,
        scheme: caseItem.payload.answers?.scheme,
        dateReceived: caseItem.dateReceived,
        submittedAt: getFormattedGBDate(caseItem.payload.submittedAt),
        status: caseItem.status,
        assignedUser: caseItem.assignedUser,
        payload: caseItem.payload,
      },
    },
  };
};

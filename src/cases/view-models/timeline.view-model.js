import { getFormattedGBDate } from "../../common/helpers/date-helpers.js";
import { setActiveLink } from "../../common/helpers/navigation-helpers.js";

export const createTimelineViewModel = (caseItem) => {
  const caseRef = caseItem.caseRef;
  const code = caseItem.workflowCode;

  return {
    pageTitle: `Timeline ${caseRef}`,
    pageHeading: `Timeline`,
    breadcrumbs: [],
    links: setActiveLink(caseItem.links, "timeline"),
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
        currentStatus: caseItem.currentStatus,
        assignedUser: caseItem.assignedUser,
        payload: caseItem.payload,
        timeline: caseItem.timeline,
        banner: caseItem.banner,
      },
    },
  };
};

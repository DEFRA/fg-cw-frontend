import { setActiveLink } from "../../common/helpers/navigation-helpers.js";

export const createViewTabViewModel = (agreementData, tabId) => {
  return {
    pageTitle: `Agreement ${agreementData.caseRef}`,
    breadcrumbs: [],
    data: {
      ...agreementData,
      links: setActiveLink(agreementData.links, tabId),
    },
  };
};

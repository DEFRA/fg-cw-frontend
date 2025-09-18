import { setActiveLink } from "../../common/helpers/navigation-helpers.js";

export const createViewTabViewModel = (tabData, tabId) => {
  const links = setActiveLink(tabData.links, tabId);
  const title = links.find((link) => link.active)?.text ?? tabId;

  return {
    pageTitle: `${title} ${tabData.caseRef}`,
    breadcrumbs: [],
    data: {
      ...tabData,
      links,
    },
  };
};

import { setActiveLink } from "../../common/helpers/navigation-helpers.js";
import { createHeaderViewModel } from "../../common/view-models/header.view-model.js";

export const createViewTabViewModel = ({ page, request, tabId }) => {
  const tabData = page.data;
  const links = setActiveLink(tabData.links, tabId);
  const title = links.find((link) => link.active)?.text ?? tabId;
  return {
    pageTitle: `${title} ${tabData.caseRef}`,
    header: createHeaderViewModel({ page, request }),
    breadcrumbs: [],
    data: {
      ...tabData,
      links,
    },
  };
};

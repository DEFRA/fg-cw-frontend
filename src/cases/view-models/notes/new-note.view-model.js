import { resolveBannerPaths } from "../../../common/helpers/resolvePaths.js";

export const createNewNoteViewModel = (caseItem, errors) => {
  return {
    pageTitle: `New Note ${caseItem.caseRef}`,
    pageHeading: `Add a note`,
    breadcrumbs: [],
    data: {
      caseId: caseItem._id,
      banner: resolveBannerPaths(caseItem.banner, caseItem),
    },
    errors,
  };
};

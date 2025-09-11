import { resolveBannerPaths } from "../../../common/helpers/resolvePaths.js";

export const createNewNoteViewModel = (caseItem, errors, formData) => {
  return {
    pageTitle: `New Note ${caseItem.caseRef}`,
    pageHeading: `Add a note`,
    breadcrumbs: [],
    links: caseItem.links.map((link) => ({
      text: link.text,
      href: link.href,
      active: link.id === "notes",
    })),
    data: {
      caseId: caseItem._id,
      banner: resolveBannerPaths(caseItem.banner, caseItem),
      formData: formData || {},
    },
    errors,
    errorList: buildErrorList(errors),
  };
};

const buildErrorList = (errors) => {
  if (!errors) {
    return [];
  }

  const errorList = [];

  if (errors.text) {
    errorList.push({
      text: errors.text,
      href: "#text",
    });
  }

  if (errors.save) {
    errorList.push({
      text: errors.save,
    });
  }

  return errorList;
};

import { setActiveLink } from "../../../common/helpers/navigation-helpers.js";

export const createNewNoteViewModel = (caseItem, errors, formData) => {
  return {
    pageTitle: `New Note ${caseItem.caseRef}`,
    pageHeading: `Add a note`,
    breadcrumbs: [],
    links: setActiveLink(caseItem.links, "notes"),
    data: {
      caseId: caseItem._id,
      banner: caseItem.banner,
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

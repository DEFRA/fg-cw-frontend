import { setActiveLink } from "../../../common/helpers/navigation-helpers.js";
import { createHeaderViewModel } from "../../../common/view-models/header.view-model.js";

export const createNewNoteViewModel = ({ page, request, errors, formData }) => {
  const caseItem = page.data;
  return {
    pageTitle: `New Note ${caseItem.caseRef}`,
    pageHeading: `Add a note`,
    header: createHeaderViewModel({ page, request }),
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

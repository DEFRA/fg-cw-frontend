import { resolveBannerPaths } from "../../../common/helpers/resolvePaths.js";
import {
  DATE_FORMAT_SHORT_MONTH,
  formatDate,
} from "../../../common/nunjucks/filters/format-date.js";

export const createViewNotesViewModel = (caseItem) => {
  return {
    pageTitle: `Notes ${caseItem.caseRef}`,
    pageHeading: `Notes`,
    breadcrumbs: [],
    data: {
      caseId: caseItem._id,
      banner: resolveBannerPaths(caseItem.banner, caseItem),
      notes: mapNotes(caseItem.comments),
    },
  };
};

const mapNotes = (notes) => {
  if (!notes) {
    return undefined;
  }

  return {
    title: "All notes",
    head: [
      {
        text: "Date",
        attributes: {
          "aria-sort": "ascending",
        },
      },
      {
        text: "Type",
      },
      {
        text: "Note",
        classes: "govuk-!-width-one-half",
      },
      {
        text: "Added by",
      },
    ],
    rows: notes.map(({ createdAt, createdBy, title, text }) => [
      { text: formatDate(createdAt, DATE_FORMAT_SHORT_MONTH) },
      { text: title },
      {
        text,
      },
      { text: createdBy },
    ]),
  };
};

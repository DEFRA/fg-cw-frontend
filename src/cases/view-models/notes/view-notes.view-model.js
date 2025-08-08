import { resolveBannerPaths } from "../../../common/helpers/resolvePaths.js";
import {
  DATE_FORMAT_SHORT_MONTH,
  DATE_FORMAT_SORTABLE_DATE,
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
        attributes: {
          "aria-sort": "ascending",
        },
      },
      {
        text: "Note",
        classes: "govuk-!-width-one-half",
      },
      {
        text: "Added by",
        attributes: {
          "aria-sort": "ascending",
        },
      },
    ],
    rows: notes.map(({ ref, createdAt, createdBy, title, text }) => [
      {
        html: `<a id="note-ref-${ref}"></a>${formatDate(createdAt, DATE_FORMAT_SHORT_MONTH)}`,
        attributes: {
          "data-sort-value": formatDate(createdAt, DATE_FORMAT_SORTABLE_DATE),
        },
      },
      { text: title },
      {
        text,
      },
      { text: createdBy },
    ]),
  };
};

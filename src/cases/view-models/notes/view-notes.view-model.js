import { resolveBannerPaths } from "../../../common/helpers/resolvePaths.js";
import {
  DATE_FORMAT_SHORT_MONTH,
  DATE_FORMAT_SORTABLE_DATE,
  formatDate,
} from "../../../common/nunjucks/filters/format-date.js";

export const createViewNotesViewModel = (caseItem, selectedNoteRef) => {
  return {
    pageTitle: `Notes ${caseItem.caseRef}`,
    pageHeading: `Notes`,
    breadcrumbs: [],
    data: {
      caseId: caseItem._id,
      banner: resolveBannerPaths(caseItem.banner, caseItem),
      notes: mapNotes(caseItem.comments, selectedNoteRef),
      addNoteUrl: `/cases/${caseItem._id}/notes/new`,
    },
  };
};

const mapNotes = (notes, selectedNoteRef) => {
  if (!notes) {
    return undefined;
  }

  return {
    title: "All notes",
    head: [
      {
        text: "Date",
        attributes: {
          "aria-sort": "descending",
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
    rows: notes.map(({ ref, createdAt, createdBy, title, text }) => ({
      createdAt: {
        ref,
        text: formatDate(createdAt, DATE_FORMAT_SHORT_MONTH),
        sortValue: formatDate(createdAt, DATE_FORMAT_SORTABLE_DATE),
      },
      type: { text: title },
      note: {
        ref,
        href: `?selectedNoteRef=${ref}#note-${ref}`,
        isSelected: ref === selectedNoteRef,
        text,
        classes: "wrap-all-text",
      },
      addedBy: { text: createdBy },
    })),
  };
};

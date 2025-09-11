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
    links: caseItem.links.map((link) => ({
      text: link.text,
      href: link.href,
      active: link.id === "notes",
    })),
    data: {
      caseId: caseItem._id,
      banner: caseItem.banner,
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
    rows: notes.map(({ ref, createdAt, createdBy, title, text }) => {
      const isSelected = ref === selectedNoteRef;

      return {
        createdAt: {
          ref,
          text: formatDate(createdAt, DATE_FORMAT_SHORT_MONTH),
          classes: isSelected ? "govuk-table__cell--selected" : "",
          attributes: {
            "data-sort-value": formatDate(createdAt, DATE_FORMAT_SORTABLE_DATE),
          },
        },
        type: { text: title },
        note: {
          ref,
          href: `?selectedNoteRef=${ref}#note-${ref}`,
          isSelected,
          text,
          classes: "wrap-all-text",
        },
        addedBy: { text: createdBy },
      };
    }),
  };
};

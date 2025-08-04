import { getFormattedGBDate } from "../../common/helpers/date-helpers.js";
import { resolveBannerPaths } from "../../common/helpers/resolvePaths.js";

export const createNotesViewModel = (caseItem) => {
  return {
    pageTitle: `Notes ${caseItem.caseRef}`,
    pageHeading: `Notes`,
    breadcrumbs: [],
    data: {
      caseId: caseItem._id,
      banner: resolveBannerPaths(caseItem.banner, caseItem),
      notes: mapNotes(caseItem.notes),
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
        classes: "govuk-!-width-one-quarter",
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
        classes: "govuk-!-width-one-quarter",
      },
    ],
    rows: notes.map(({ createdAt, createdBy, title, text }) => [
      { text: getFormattedGBDate(createdAt) },
      {
        html: createDetailsHtml(title, text),
      },
      { text: createdBy },
    ]),
  };
};

const createDetailsHtml = (summaryText, text) => `
<details class="govuk-details">
  <summary class="govuk-details__summary">
    <span class="govuk-details__summary-text">
      ${summaryText}
    </span>
  </summary>
  <div class="govuk-details__text">
    ${text}
  </div>
</details>
`;

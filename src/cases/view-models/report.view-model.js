import { createHeaderViewModel } from "../../common/view-models/header.view-model.js";

const capitalise = (str = "") => {
  if (!str || typeof str !== "string") {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const numericCell = (count, classes = "") => ({
  text: String(count),
  format: "numeric",
  classes,
});

// Flatten the phase > stage > status tree into indented table rows. Indentation
// and emphasis are expressed with GOV.UK spacing/typography utility classes so
// no bespoke CSS is needed.
const statusRow = (status) => [
  { text: status.name, classes: "govuk-!-padding-left-8" },
  numericCell(status.count),
];

const stageRows = (stage) => [
  [
    { text: stage.name, classes: "govuk-!-padding-left-4" },
    numericCell(stage.count),
  ],
  ...stage.statuses.map(statusRow),
];

const phaseRows = (phase) => [
  [
    { text: phase.name, classes: "govuk-!-font-weight-bold" },
    numericCell(phase.count, "govuk-!-font-weight-bold"),
  ],
  ...phase.stages.flatMap(stageRows),
];

const mapPhasesToRows = (phases = []) => phases.flatMap(phaseRows);

export const createReportViewModel = ({ page, request }) => {
  const data = page.data;

  const hasSelection = Boolean(data.selectedCaseType);

  // A blank placeholder leads the list so the dropdown starts unselected on the
  // first visit; it is selected only while no case type has been chosen.
  const placeholder = {
    value: "",
    text: "Select a case type",
    selected: !hasSelection,
  };

  const caseTypeItems = [
    placeholder,
    ...data.availableCaseTypes.map((code) => ({
      value: code,
      text: capitalise(code),
      selected: code === data.selectedCaseType,
    })),
  ];

  const rows = mapPhasesToRows(data.phases);

  return {
    pageTitle: "Case reports",
    pageHeading: "Case reports",
    header: createHeaderViewModel({ page, request }),
    breadcrumbs: [],
    data: {
      selectedCaseType: data.selectedCaseType,
      selectedCaseTypeLabel: capitalise(data.selectedCaseType),
      caseTypeItems,
      total: data.total,
      table: { rows },
      hasSelection,
      hasResults: rows.length > 0,
    },
  };
};

import {
  DATE_FORMAT_SHORT_MONTH,
  formatDate,
} from "../../common/nunjucks/filters/format-date.js";

export const createCaseListViewModel = (cases, assignedCaseId) => {
  const casesTable = mapCasesToTable(cases);

  const assignedUserSuccessMessage = createAssignedUserSuccessMessage(
    assignedCaseId,
    casesTable.rows,
  );

  return {
    pageTitle: "Cases",
    pageHeading: "Cases",
    breadcrumbs: [],
    data: {
      tabItems: [
        {
          label: `SFI applications (${casesTable.rows.length})`,
          id: "all-cases",
          data: casesTable,
        },
      ],
      assignedUserSuccessMessage,
    },
  };
};

const mapCasesToTable = (cases) => {
  return {
    head: [
      { text: "Select" },
      { text: "ID" },
      { text: "Business" },
      { text: "SBI" },
      { text: "Submitted" },
      { text: "Status" },
      { text: "Assignee" },
    ],
    rows: cases.map(({ _id, caseRef, payload, status, assignedUser }) => ({
      _id,
      select: {
        value: _id,
      },
      id: {
        href: `/cases/${_id}`,
        text: mapText(caseRef),
      },
      business: {
        text: "[business name]",
      },
      sbi: {
        text: mapText(payload?.identifiers?.sbi),
      },
      submitted: {
        text: mapSubmittedAt(payload.submittedAt),
      },
      status: mapStatus(status),
      assignee: {
        text: mapText(assignedUser?.name, "Not assigned"),
      },
    })),
  };
};

export const mapText = (text, defaultText = "") => {
  return text || defaultText;
};

const mapSubmittedAt = (submittedAt) => {
  return submittedAt ? formatDate(submittedAt, DATE_FORMAT_SHORT_MONTH) : "";
};

const STATUS_TO_CLASS = {
  DEFAULT: "govuk-tag--grey",
  NEW: "govuk-tag--blue",
  "IN PROGRESS": "govuk-tag--yellow",
  APPROVED: "govuk-tag--green",
  COMPLETED: "govuk-tag--green",
};

const mapStatus = (status) => {
  const statusClass = STATUS_TO_CLASS[status] || STATUS_TO_CLASS.DEFAULT;

  return {
    text: capitalise(status),
    classes: statusClass,
  };
};

const capitalise = (str = "") => {
  if (!str || typeof str !== "string") {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const createAssignedUserSuccessMessage = (assignedCaseId, cases) => {
  if (!assignedCaseId) {
    return null;
  }

  const assignedCase = findAssignedCase(assignedCaseId, cases);
  if (!hasAssignedUser(assignedCase)) {
    return null;
  }

  return buildSuccessMessage(assignedCase);
};

const hasAssignedUser = (caseItem) =>
  Boolean(caseItem?.assignee && caseItem.assignee.text !== "");

const findAssignedCase = (assignedCaseId, cases) =>
  cases.find(({ _id }) => _id === assignedCaseId);

const buildSuccessMessage = ({ id, assignee }) => ({
  heading: "Case assigned successfully",
  ref: id.text,
  link: id.href,
  assignedUserName: assignee.text,
});

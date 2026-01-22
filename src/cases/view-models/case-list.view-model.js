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

const attributes = {
  "aria-sort": "none",
};

const headerClasses = "sortable-header";

const mapCasesToTable = (cases) => {
  return {
    head: [
      { text: "Select" },
      {
        text: "ID",
        attributes,
        headerClasses,
      },
      { text: "Business", attributes, headerClasses },
      { text: "SBI", attributes, headerClasses },
      { text: "Submitted", attributes, headerClasses },
      { text: "Status", attributes, headerClasses },
      { text: "Assignee", attributes, headerClasses },
    ],
    rows: cases.map(
      ({
        _id,
        caseRef,
        payload,
        currentStatus,
        currentStatusTheme,
        assignedUser,
        // eslint-disable-next-line complexity
      }) => ({
        _id,
        select: {
          value: _id,
        },
        id: {
          href: `/cases/${_id}`,
          text: mapText(caseRef),
          attributes: { "data-sort-value": caseRef },
        },
        business: {
          text: mapText(payload?.answers?.applicant?.business?.name),
        },
        sbi: {
          text: mapText(payload?.identifiers?.sbi),
        },
        submitted: {
          text: mapSubmittedAt(payload.submittedAt),
          attributes: { "data-sort-value": Date.parse(payload.submittedAt) },
        },
        status: mapStatus(currentStatus, currentStatusTheme),
        assignee: {
          text: mapText(assignedUser?.name, "Not assigned"),
        },
      }),
    ),
  };
};

export const mapText = (text, defaultText = "") => {
  return text || defaultText;
};

const mapSubmittedAt = (submittedAt) => {
  return submittedAt ? formatDate(submittedAt, DATE_FORMAT_SHORT_MONTH) : "";
};

const mapStatus = (status, theme) => {
  return {
    text: capitalise(status),
    theme: theme ?? "",
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

import {
  DATE_FORMAT_SHORT_MONTH,
  formatDate,
} from "../../common/nunjucks/filters/format-date.js";
import { createHeaderViewModel } from "../../common/view-models/header.view-model.js";

export const createCaseListViewModel = ({ page, request, assignedCaseId }) => {
  const casesTable = mapCasesToTable(page.data.cases, request.url);
  const assignedUserSuccessMessage = createAssignedUserSuccessMessage(
    assignedCaseId,
    casesTable.rows,
  );

  const pagination = mapDataToPagination(page.data.pagination, request.url);

  return {
    pageTitle: "Cases",
    pageHeading: "Cases",
    header: createHeaderViewModel({ page, request }),
    breadcrumbs: [],
    data: {
      tabItems: [
        {
          label: `SFI applications (${page.data.pagination.totalCount})`,
          id: "all-cases",
          data: casesTable,
        },
      ],
      assignedUserSuccessMessage,
      pagination,
    },
  };
};

const attributes = {
  "aria-sort": "none",
};

const sortIcons = {
  idle: `
<svg width="22" height="22" focusable="false" aria-hidden="true" role="img" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.1875 9.5L10.9609 3.95703L13.7344 9.5H8.1875Z" fill="currentColor"></path>
<path d="M13.7344 12.0781L10.9609 17.6211L8.1875 12.0781H13.7344Z" fill="currentColor"></path>
</svg>
`,
  asc: `<svg width="22" height="22" focusable="false" aria-hidden="true" role="img" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6.5625 15.5L11 6.63125L15.4375 15.5H6.5625Z" fill="currentColor"></path>
</svg>`,
  desc: `<svg width="22" height="22" focusable="false" aria-hidden="true" role="img" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.4375 7L11 15.8687L6.5625 7L15.4375 7Z" fill="currentColor"></path>
</svg>`,
};

const getOrder = (order) => {
  if (!order) {
    return {
      code: "asc",
      icon: sortIcons.idle,
      ariaSort: "none",
    };
  }

  if (order === "asc") {
    return {
      code: "desc",
      icon: sortIcons.asc,
      ariaSort: "ascending",
    };
  }

  return {
    code: "asc",
    icon: sortIcons.desc,
    ariaSort: "descending",
  };
};

const getSortableHeader = ({ text, field, currentURL }) => {
  const { searchParams, pathname } = currentURL;

  const params = new URLSearchParams();

  const order = getOrder(searchParams.get(field));

  order.code && params.set(field, order.code);

  const href = `${pathname}${params.size ? "?" + params : ""}`;

  return {
    html: `<a href="${href}">${text} ${order.icon}</a>`,
    attributes: {
      "aria-sort": order.ariaSort,
    },
  };
};

const mapCasesToTable = (cases, currentURL) => {
  return {
    head: [
      { text: "Select" },
      getSortableHeader({
        text: "ID",
        field: "caseRef",
        currentURL,
      }),
      { text: "Business", attributes },
      { text: "SBI", attributes },
      getSortableHeader({
        text: "Submitted",
        field: "createdAt",
        currentURL,
      }),
      { text: "Status", attributes },
      { text: "Assignee", attributes },
    ],
    rows: cases.map(
      ({
        _id,
        caseRef,
        payload,
        createdAt,
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
        },
        business: {
          text: mapText(payload?.answers?.applicant?.business?.name),
        },
        sbi: {
          text: mapText(payload?.identifiers?.sbi),
        },
        submitted: {
          text: mapSubmittedAt(createdAt),
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

const mapDataToPagination = (data, currentURL) => {
  const pagination = {
    items: [],
    classes: "govuk-!-margin-bottom-2",
  };

  if (data.hasPreviousPage) {
    const params = new URLSearchParams(currentURL.searchParams);
    params.set("cursor", data.startCursor);
    params.set("direction", "backward");

    pagination.previous = {
      href: `${currentURL.pathname}?${params}`,
    };
  }

  if (data.hasNextPage) {
    const params = new URLSearchParams(currentURL.searchParams);
    params.set("cursor", data.endCursor);
    params.set("direction", "forward");

    pagination.next = {
      href: `${currentURL.pathname}?${params}`,
    };
  }

  return pagination;
};

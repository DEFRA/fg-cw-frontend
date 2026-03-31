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

const linkIcon = `<svg aria-hidden="true" height="20" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 511.999"><path d="M476.335 35.664v.001c47.554 47.552 47.552 125.365.002 172.918l-101.729 101.73c-60.027 60.025-162.073 42.413-194.762-32.45 35.888-31.191 53.387-21.102 87.58-6.638 20.128 8.512 43.74 3.955 60.08-12.387l99.375-99.371c21.49-21.493 21.492-56.662 0-78.155-21.489-21.488-56.677-21.472-78.151 0l-71.278 71.28c-23.583-11.337-50.118-14.697-75.453-10.07a121.476 121.476 0 0118.767-24.207l82.651-82.65c47.554-47.551 125.365-47.555 172.918-.001zM35.664 476.334l.001.001c47.554 47.552 125.365 47.552 172.917 0l85.682-85.682a121.496 121.496 0 0019.325-25.157c-27.876 6.951-57.764 4.015-83.932-8.805l-70.192 70.19c-21.472 21.471-56.658 21.492-78.149 0-21.492-21.491-21.493-56.658 0-78.149l99.375-99.376c20.363-20.363 61.002-26.435 91.717 1.688 29.729-3.133 41.275-8.812 59.742-26.493-39.398-69.476-137.607-80.013-194.757-22.863L35.664 303.417c-47.552 47.553-47.552 125.364 0 172.917z"/></svg>`;

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

const getLinkedHtml = (isLinked) => {
  return isLinked
    ? `<span class="govuk-!-display-inline-block govuk-!-margin-top-2">${linkIcon}</span><span class="govuk-visually-hidden">Linked case</span>`
    : '<span class="govuk-visually-hidden">Case not linked</span>';
};

const mapCasesToTable = (cases, currentURL) => {
  return {
    head: [
      { text: "Select" },
      {
        html: `${linkIcon} <span class="govuk-visually-hidden">Linked cases</span>`,
      },
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
        hasLinkedCases,
        // eslint-disable-next-line complexity
      }) => ({
        _id,
        select: {
          value: _id,
        },
        linked: {
          html: getLinkedHtml(hasLinkedCases),
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

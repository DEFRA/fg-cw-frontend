import { createCaseListViewModel } from "./case-list.view-model.js";

export const createCaseListByTypeViewModel = ({
  page,
  request,
  caseType,
  assignedCaseId,
}) => {
  const base = createCaseListViewModel({ page, request, assignedCaseId });

  const totalCount = page.data.pagination.totalCount;
  const formAction = `/types/${encodeURIComponent(caseType)}/cases`;
  const title = `Cases \u2013 ${caseType}`;

  return {
    pageTitle: title,
    pageHeading: title,
    header: base.header,
    breadcrumbs: base.breadcrumbs,
    data: {
      formAction,
      assignedUserSuccessMessage: base.data.assignedUserSuccessMessage,
      pagination: base.data.pagination,
      searchValue: base.data.searchValue,
      tabItems: base.data.tabItems.map((tab) => ({
        id: tab.id,
        label: `${title} (${totalCount})`,
        data: tab.data,
      })),
      emptyMessage:
        totalCount === 0 ? "There are no cases for this case type" : undefined,
    },
  };
};

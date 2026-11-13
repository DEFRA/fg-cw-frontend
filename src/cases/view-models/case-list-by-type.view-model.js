import { createCaseListViewModel } from "./case-list.view-model.js";

export const createCaseListByTypeViewModel = ({
  page,
  request,
  caseType,
  assignedCaseId,
}) => {
  const base = createCaseListViewModel({ page, request, assignedCaseId });

  const totalCount = page.data.pagination.totalCount;
  const formAction = `/types/${caseType}/cases`;
  const title = `Cases \u2013 ${caseType}`;

  return {
    ...base,
    pageTitle: title,
    pageHeading: title,
    data: {
      ...base.data,
      formAction,
      tabItems: base.data.tabItems.map((tab) => ({
        ...tab,
        label: title,
      })),
      emptyMessage:
        totalCount === 0 ? "There are no cases for this case type" : undefined,
    },
  };
};

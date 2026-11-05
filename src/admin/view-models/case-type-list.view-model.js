import { createHeaderViewModel } from "../../common/view-models/header.view-model.js";

const PLACEHOLDER_NAME = "[Name]";
const PLACEHOLDER_STATUS = "[Status]";

export const createCaseTypeListViewModel = ({ page, request }) => {
  const caseTypes = page.data;
  const caseTypeList = Array.isArray(caseTypes) ? caseTypes : [];

  return {
    pageTitle: "Case types",
    pageHeading: "Case types",
    header: createHeaderViewModel({ page, request }),
    breadcrumbs: [],
    data: {
      caseTypes: {
        head: [{ text: "Code" }, { text: "Name" }, { text: "Status" }],
        rows: caseTypeList.map(({ code }) => ({
          code: {
            text: code,
            href: `/types/${code}/cases`,
          },
          name: PLACEHOLDER_NAME,
          status: PLACEHOLDER_STATUS,
        })),
      },
    },
  };
};

import Boom from "@hapi/boom";
import { createHeaderViewModel } from "../../common/view-models/header.view-model.js";

export const pageTemplates = { dedupe: "pages/dedupe-summary" };
export const createCasePageViewModel = ({ page, request }) => {
  if (!pageTemplates[page.data.pageType]) {
    throw Boom.notFound("Unknown case list page type");
  }
  return {
    pageTitle: page.data.title,
    header: createHeaderViewModel({ page, request }),
    data: page.data,
  };
};
export const createCaseGroupViewModel = ({ page, request }) => ({
  pageTitle: page.data.title,
  header: createHeaderViewModel({ page, request }),
  errorList: page.data.errorList,
  data: page.data,
});

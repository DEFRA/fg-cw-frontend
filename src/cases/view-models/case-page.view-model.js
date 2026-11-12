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
// eslint-disable-next-line complexity
const labelItems = (kase, submitted) => {
  const current =
    submitted ??
    (kase.label
      ? JSON.stringify({ code: kase.label.code, data: kase.label.data ?? null })
      : "");
  const items = [...kase.options];
  if (current && !items.some((item) => item.value === current)) {
    const label = kase.label;
    items.push({
      value: current,
      text: `${label?.code ?? "Previous selection"} with ${label?.data?.duplicateOf ?? ""} (historical target)`,
    });
  }
  return items.map((item) => ({ ...item, selected: item.value === current }));
};

/* eslint-disable complexity -- Keep the spike's form mapping in one place. */
export const createCaseGroupViewModel = ({
  page,
  request,
  form = {},
  error,
}) => ({
  pageTitle: `SBI ${page.data.details.sbi}`,
  header: createHeaderViewModel({ page, request }),
  errorList: error ? [{ text: error, href: "#assignee" }] : [],
  data: {
    ...page.data,
    summaryHref: `/types/${request.params.caseType}/pages/${request.params.pageKey}`,
    usersSelect: [
      {
        value: "",
        text: "Not set",
        selected: !(form.assignee ?? page.data.owner?.id),
      },
      ...page.data.users.map((user) => ({
        value: user.id,
        text: user.name,
        selected: (form.assignee ?? page.data.owner?.id) === user.id,
      })),
    ],
    cases: page.data.cases.map((kase) => ({
      ...kase,
      items: labelItems(kase, form[`label-${kase.caseRef}`]),
    })),
  },
});
/* eslint-enable complexity */

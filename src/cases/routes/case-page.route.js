import {
  findCaseGroupUseCase,
  findCasePageUseCase,
  saveCaseGroupUseCase,
} from "../use-cases/case-page.use-case.js";
import {
  createCaseGroupViewModel,
  createCasePageViewModel,
  pageTemplates,
} from "../view-models/case-page.view-model.js";

const auth = (request) => ({
  token: request.auth.credentials.token,
  user: request.auth.credentials.user,
});
const base = "/types/{caseType}/pages/{pageKey}";
const group = `${base}/groups/{groupKey}`;
export const casePageRoutes = [
  {
    method: "GET",
    path: base,
    async handler(request, h) {
      const page = await findCasePageUseCase(auth(request), request.params);
      const model = createCasePageViewModel({ page, request });
      return h.view(pageTemplates[page.data.pageType], model);
    },
  },
  {
    method: "GET",
    path: group,
    async handler(request, h) {
      const page = await findCaseGroupUseCase(auth(request), request.params);
      return h.view(
        "pages/dedupe-group",
        createCaseGroupViewModel({ page, request }),
      );
    },
  },
  {
    method: "POST",
    path: group,
    // eslint-disable-next-line complexity
    async handler(request, h) {
      try {
        const result = await saveCaseGroupUseCase(
          auth(request),
          request.params,
          request.payload,
        );
        return h.redirect(result.redirectHref);
      } catch (error) {
        const status = error.output?.statusCode;
        if (![400, 409].includes(status)) {
          throw error;
        }
        const supplied = error.data?.payload;
        const page =
          supplied?.page ??
          (await findCaseGroupUseCase(auth(request), request.params));
        if (!supplied?.page) {
          page.data.errorList = [
            {
              text: supplied?.message ?? error.message,
              href: "#dedupe-review",
            },
          ];
        }
        return h
          .view(
            "pages/dedupe-group",
            createCaseGroupViewModel({
              page,
              request,
            }),
          )
          .code(status);
      }
    },
  },
];

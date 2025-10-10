import { findAllCasesUseCase } from "../use-cases/find-all-cases.use-case.js";
import { createCaseListViewModel } from "../view-models/case-list.view-model.js";

export const listCasesRoute = {
  method: "GET",
  path: "/cases",
  async handler(request, h) {
    const { assignedCaseId } = request.query;

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const cases = await findAllCasesUseCase(authContext);

    const viewModel = createCaseListViewModel(cases, assignedCaseId);

    return h.view("pages/case-list", viewModel);
  },
};

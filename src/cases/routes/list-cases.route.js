import { findAllCasesUseCase } from "../use-cases/find-all-cases.use-case.js";
import { createCaseListViewModel } from "../view-models/case-list.view-model.js";

export const listCasesRoute = {
  method: "GET",
  path: "/cases",
  async handler(_request, h) {
    const cases = await findAllCasesUseCase();

    const viewModel = createCaseListViewModel(cases);

    return h.view("pages/case-list", viewModel);
  },
};

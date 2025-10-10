import { findCaseByIdUseCase } from "../../cases/use-cases/find-case-by-id.use-case.js";
import { getComponentsContentUseCase } from "../use-cases/components.use-case.js";
import { createComponentsViewModel } from "../view-models/components.view-model.js";

export const viewComponentsRoute = {
  method: "GET",
  path: "/cases/{caseId}/components",
  handler: async (request, h) => {
    const { caseId } = request.params;
    const caseItem = await findCaseByIdUseCase(caseId);
    const content = getComponentsContentUseCase(request.yar);
    const viewModel = createComponentsViewModel(caseItem, content);

    return h.view("temp/components", viewModel);
  },
};

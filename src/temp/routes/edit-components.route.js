import { findCaseByIdUseCase } from "../../cases/use-cases/find-case-by-id.use-case.js";
import { getComponentsContentUseCase } from "../use-cases/components.use-case.js";
import { createComponentsEditViewModel } from "../view-models/components.view-model.js";

export const editComponentsRoute = {
  method: "GET",
  path: "/cases/{caseId}/components/edit",
  handler: async (request, h) => {
    const { caseId } = request.params;
    const caseItem = await findCaseByIdUseCase(caseId);
    const content = getComponentsContentUseCase(request.yar);
    const viewModel = createComponentsEditViewModel(caseItem, { content });

    return h.view("temp/components-edit", viewModel);
  },
};

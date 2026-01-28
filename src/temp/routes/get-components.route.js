import { findCaseByIdUseCase } from "../../cases/use-cases/find-case-by-id.use-case.js";
import { getComponentsContentUseCase } from "../use-cases/components.use-case.js";
import { createComponentsViewModel } from "../view-models/components.view-model.js";

export const viewComponentsRoute = {
  method: "GET",
  path: "/cases/{caseId}/components",
  handler: async (request, h) => {
    const { caseId } = request.params;

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const page = await findCaseByIdUseCase(authContext, caseId);
    const content = getComponentsContentUseCase(request.yar);
    const viewModel = createComponentsViewModel({ page, request, content });

    return h.view("temp/components", viewModel);
  },
};

import { findCaseByIdUseCase } from "../../cases/use-cases/find-case-by-id.use-case.js";
import { updateComponentsPreviewUseCase } from "../use-cases/components.use-case.js";
import { createComponentsEditViewModel } from "../view-models/components.view-model.js";

export const updateComponentsRoute = {
  method: "POST",
  path: "/cases/{caseId}/components/edit",
  handler: async (request, h) => {
    const { caseId } = request.params;

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const page = await findCaseByIdUseCase(authContext, caseId);
    const jsonPayload = request.payload?.jsonPayload;
    const formData = { jsonPayload };
    const result = updateComponentsPreviewUseCase({
      session: request.yar,
      jsonPayload,
    });

    if (result.errors) {
      const viewModel = createComponentsEditViewModel({
        page,
        request,
        formData,
        errors: result.errors,
      });

      return h.view("temp/components-edit", viewModel);
    }

    return h.redirect(`/cases/${caseId}/components`);
  },
};

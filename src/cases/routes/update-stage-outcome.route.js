import { updateStageOutcomeUseCase } from "../use-cases/update-stage-outcome-use.case.js";
import { createTaskListViewModel } from "../view-models/task-list.view-model.js";

export const updateStageOutcomeRoute = {
  method: "POST",
  path: "/cases/{caseId}/stage/outcome",
  handler: async (request, h) => {
    const {
      params: { caseId },
      payload,
    } = request;

    const result = await updateStageOutcomeUseCase(caseId, payload);

    if (!result.success) {
      return h.view(
        "pages/task-list",
        createViewModelWithErrors(result, payload),
      );
    }

    return h.redirect(`/cases/${caseId}`);
  },
};

const createViewModelWithErrors = (result, payload) => {
  const { caseData, errors } = result;
  const errorList = Object.values(errors);
  const viewModel = createTaskListViewModel(caseData, errors, payload);

  return {
    ...viewModel,
    errors,
    errorList,
    values: payload,
  };
};

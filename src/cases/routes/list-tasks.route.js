import { getFlashData } from "../../common/helpers/flash-helpers.js";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { createTaskListViewModel } from "../view-models/task-list.view-model.js";

export const listTasksRoute = {
  method: "GET",
  path: "/cases/{caseId}",
  async handler(request, h) {
    const caseData = await findCaseByIdUseCase(request.params.caseId);

    const { errors, formData } = getFlashData(request);
    const viewModel = createTaskListViewModel(caseData, errors, formData);

    return h.view("pages/task-list", viewModel);
  },
};

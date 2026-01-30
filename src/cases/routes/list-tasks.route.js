import { getFlashData } from "../../common/helpers/flash-helpers.js";
import { logger } from "../../common/logger.js";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { createTaskListViewModel } from "../view-models/task-list.view-model.js";

export const listTasksRoute = {
  method: "GET",
  path: "/cases/{caseId}",
  async handler(request, h) {
    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    logger.info(`Get tasks for case ${request.params.caseId}`);

    const page = await findCaseByIdUseCase(
      authContext,
      request.params.caseId,
      "tasks",
    );

    const { errors, formData } = getFlashData(request);
    const viewModel = createTaskListViewModel({
      page,
      request,
      errors,
      formData,
    });

    logger.info(`Finished: Get tasks for case ${request.params.caseId}`);

    return h.view("pages/task-list", viewModel);
  },
};

import { getFlashData } from "../../common/helpers/flash-helpers.js";
import { logger } from "../../common/logger.js";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { createTaskDetailViewModel } from "../view-models/task-detail.view-model.js";

export const viewTaskRoute = {
  method: "GET",
  path: "/cases/{caseId}/tasks/{taskGroupCode}/{taskCode}",
  async handler(request, h) {
    logger.info(`Get task details for case ${request.params.caseId}`);

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const { errors, formData } = getFlashData(request);

    const page = await findCaseByIdUseCase(
      authContext,
      request.params.caseId,
      "task",
    );

    const viewModel = createTaskDetailViewModel({
      page,
      request,
      query: request.params,
      errors,
      formData,
    });

    logger.info(`Finished: Get task details for case ${request.params.caseId}`);

    return h.view("pages/task-detail", viewModel);
  },
};

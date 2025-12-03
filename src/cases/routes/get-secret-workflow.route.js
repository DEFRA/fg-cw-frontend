import { logger } from "../../common/logger.js";
import { findSecretWorkflowUseCase } from "../use-cases/find-secret-workflow.use-case.js";

export const getSecretWorkflowRoute = {
  method: "GET",
  path: "/secret/workflow/{workflowCode}",
  options: {
    auth: {
      mode: "required",
      strategy: "session",
    },
  },
  async handler(request, h) {
    const { credentials } = request.auth;
    const { workflowCode } = request.params;

    logger.info(`Get secret workflow ${workflowCode}`);

    const authContext = {
      token: credentials.token,
      user: credentials.user,
    };

    const responseFromApi = await findSecretWorkflowUseCase(
      authContext,
      workflowCode,
    );

    logger.info(`Finished: Get secret workflow ${workflowCode}`);

    return h.view("pages/secret", {
      data: responseFromApi,
    });
  },
};

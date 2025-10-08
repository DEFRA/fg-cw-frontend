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

    const authContext = {
      token: credentials.token,
      user: credentials.user,
    };

    const responseFromApi = await findSecretWorkflowUseCase(
      authContext,
      workflowCode,
    );

    return h.view("pages/secret", {
      data: responseFromApi,
    });
  },
};

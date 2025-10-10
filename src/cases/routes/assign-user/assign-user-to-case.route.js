import { assignUserToCaseUseCase } from "../../use-cases/assign-user-to-case.use-case.js";

export const assignUserToCaseRoute = {
  method: "POST",
  path: "/cases/assign-user",
  handler: async (request, h) => {
    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    await assignUserToCaseUseCase(authContext, request.payload);

    return h.redirect(`/cases?assignedCaseId=${request.payload.caseId}`);
  },
};

import { logger } from "../../../common/logger.js";
import { assignUserToCaseUseCase } from "../../use-cases/assign-user-to-case.use-case.js";

export const assignUserToCaseRoute = {
  method: "POST",
  path: "/cases/assign-user",
  handler: async (request, h) => {
    logger.info(
      `Assigning user ${request.payload.assignedUserId} to case ${request.payload.caseId}`,
    );
    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    await assignUserToCaseUseCase(authContext, request.payload);

    logger.info(
      `Finished: Assigning user ${request.payload.assignedUserId} to case ${request.payload.caseId}`,
    );
    return h.redirect(`/cases?assignedCaseId=${request.payload.caseId}`);
  },
};

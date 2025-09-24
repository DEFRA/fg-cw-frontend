import { assignUserToCaseUseCase } from "../../use-cases/assign-user-to-case.use-case.js";

export const assignUserToCaseRoute = {
  method: "POST",
  path: "/cases/assign-user",
  handler: async (request, h) => {
    await assignUserToCaseUseCase(request.payload);

    return h.redirect(`/cases?assignedCaseId=${request.payload.caseId}`);
  },
};

import { findAllUsersUseCase } from "../../../auth/use-cases/find-all-users.use-case.js";
import { findCaseByIdUseCase } from "../../use-cases/find-case-by-id.use-case.js";
import { createAssignUserViewModel } from "../../view-models/assign-user.view-model.js";

export const viewAssignUserToCaseRoute = {
  method: "GET",
  path: "/cases/assign-user",
  handler: async (request, h) => {
    const { caseId } = request.query;

    if (!caseId) {
      return h.redirect(`/cases#all-cases`);
    }

    const kase = await findCaseByIdUseCase(caseId);

    const users = await findAllUsersUseCase({
      allAppRoles: kase.requiredRoles.allOf,
      anyAppRoles: kase.requiredRoles.anyOf,
    });

    const viewModel = createAssignUserViewModel(kase, users);
    return h.view("pages/assign-user", viewModel);
  },
};

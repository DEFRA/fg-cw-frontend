import { findAllUsersUseCase } from "../../../auth/use-cases/find-all-users.use-case.js";
import { findCaseByIdUseCase } from "../../use-cases/find-case-by-id.use-case.js";
import { createAssignUserViewModel } from "../../view-models/assign-user.view-model.js";
import { setFlashData } from "../../../common/helpers/flash-helpers.js";

export const viewAssignUserToCaseRoute = {
  method: "GET",
  path: "/cases/assign-user",
  handler: async (request, h) => {
    const { caseId } = request.query;

    if (!caseId) {
      setFlashData(request, {
        notification: {
          variant: "error",
          text: `Choose an option`,
        },
      });
      return h.redirect(`/cases`);
    }

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const kase = await findCaseByIdUseCase(authContext, caseId);

    const users = await findAllUsersUseCase(authContext, {
      allAppRoles: kase.requiredRoles.allOf,
      anyAppRoles: kase.requiredRoles.anyOf,
    });

    const viewModel = createAssignUserViewModel(kase, users);
    return h.view("pages/assign-user", viewModel);
  },
};

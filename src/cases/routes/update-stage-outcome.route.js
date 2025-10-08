import { setFlashData } from "../../common/helpers/flash-helpers.js";
import { updateStageOutcomeUseCase } from "../use-cases/update-stage-outcome-use.case.js";

export const updateStageOutcomeRoute = {
  method: "POST",
  path: "/cases/{caseId}/stage/outcome",
  handler: async (request, h) => {
    const {
      params: { caseId },
      payload,
    } = request;

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const { errors } = await updateStageOutcomeUseCase(authContext, {
      caseId,
      actionData: extractActionData(payload),
    });

    if (errors) {
      setFlashData(request, {
        errors,
        formData: payload,
      });
    }

    return h.redirect(`/cases/${caseId}`);
  },
};

const extractActionData = (payload) => {
  const { actionId } = payload;
  const commentFieldName = `${actionId}-comment`;
  const comment = payload[commentFieldName];

  return {
    actionId,
    commentFieldName,
    comment,
  };
};

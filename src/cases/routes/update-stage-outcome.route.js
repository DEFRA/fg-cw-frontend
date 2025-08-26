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

    const actionData = extractActionData(payload);

    const { errors } = await updateStageOutcomeUseCase({ caseId, actionData });

    if (errors) {
      setFlashData(request, { errors, formData: payload });
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

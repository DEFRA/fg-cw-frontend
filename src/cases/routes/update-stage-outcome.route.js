import { setFlashData } from "../../common/helpers/flash-helpers.js";
import { updateStageOutcomeUseCase } from "../use-cases/update-stage-outcome-use.case.js";
import { logger } from "../../common/logger.js";

export const updateStageOutcomeRoute = {
  method: "POST",
  path: "/cases/{caseId}/stage/outcome",
  handler: async (request, h) => {
    const {
      params: { caseId },
      payload,
    } = request;

    logger.info(`Updating stage outcome for case ${caseId}`);

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

    logger.info(`Finished: Updating stage outcome for case ${caseId}`);

    return h.redirect(`/cases/${caseId}`);
  },
};

const extractActionData = (payload) => {
  const { actionCode } = payload;
  const commentFieldName = `${actionCode}-comment`;
  const comment = payload[commentFieldName];

  return {
    actionCode,
    commentFieldName,
    comment,
  };
};

import { setFlashData } from "../../common/helpers/flash-helpers.js";
import { logger } from "../../common/logger.js";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { updateStageOutcomeUseCase } from "../use-cases/update-stage-outcome-use.case.js";

const getAuthContext = (request) => ({
  token: request.auth.credentials.token,
  user: request.auth.credentials.user,
});

const findActionByCode = (page, actionCode) =>
  page.data?.stage?.actions?.find((a) => a.code === actionCode);

const redirectToConfirmation = (request, h, caseId, actionCode, payload) => {
  setFlashData(request, { formData: payload });
  logger.info(`Redirecting to confirmation page for action ${actionCode}`);
  return h.redirect(
    `/cases/${caseId}/stage/outcome/confirm?actionCode=${actionCode}`,
  );
};

const handleUpdateOutcome = async (
  request,
  h,
  authContext,
  caseId,
  payload,
) => {
  const { errors } = await updateStageOutcomeUseCase(authContext, {
    caseId,
    actionData: extractActionData(payload),
  });

  if (errors) {
    setFlashData(request, { errors, formData: payload });
  }

  logger.info(`Finished: Updating stage outcome for case ${caseId}`);
  return h.redirect(`/cases/${caseId}`);
};

export const updateStageOutcomeRoute = {
  method: "POST",
  path: "/cases/{caseId}/stage/outcome",
  handler: async (request, h) => {
    const {
      params: { caseId },
      payload,
    } = request;
    const { actionCode } = payload;

    logger.info(`Updating stage outcome for case ${caseId}`);

    const authContext = getAuthContext(request);
    const page = await findCaseByIdUseCase(authContext, caseId);
    const action = findActionByCode(page, actionCode);

    if (action?.confirm) {
      return redirectToConfirmation(request, h, caseId, actionCode, payload);
    }

    return handleUpdateOutcome(request, h, authContext, caseId, payload);
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

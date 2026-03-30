import {
  getFlashData,
  setFlashData,
  setFlashNotification,
} from "../../common/helpers/flash-helpers.js";
import {
  clearPendingStageOutcomeConfirmation,
  getPendingStageOutcomeConfirmation,
} from "../../common/helpers/pending-stage-outcome-confirmation-helpers.js";
import { logger } from "../../common/logger.js";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { updateStageOutcomeUseCase } from "../use-cases/update-stage-outcome-use.case.js";
import { createConfirmStageOutcomeViewModel } from "../view-models/confirm-stage-outcome.view-model.js";

const confirmStageOutcomePath = (caseId, actionCode) =>
  `/cases/${caseId}/stage/outcome/confirm?actionCode=${actionCode}`;

const redirectToCaseWithExpiredMessage = (request, h, caseId) => {
  setFlashNotification(request, {
    type: "warning",
    title: "Confirmation page expired",
    text: "Enter the decision details again before confirming this action.",
  });

  return h.redirect(`/cases/${caseId}`);
};

const getCommentFromFormData = (formData, commentFieldName) => {
  if (formData[commentFieldName] !== undefined) {
    return formData[commentFieldName];
  }

  if (formData.comment !== undefined) {
    return formData.comment;
  }

  return undefined;
};

const getPendingComment = (pendingConfirmation) =>
  pendingConfirmation?.comment ?? "";

const resolvePendingConfirmation = (
  request,
  caseId,
  actionCode,
  formData = {},
) => {
  const pendingConfirmation = getPendingStageOutcomeConfirmation(request, {
    caseId,
    actionCode,
  });

  const commentFieldName = `${actionCode}-comment`;
  const commentFromFormData = getCommentFromFormData(
    formData,
    commentFieldName,
  );

  return {
    pendingConfirmation,
    comment: commentFromFormData ?? getPendingComment(pendingConfirmation),
  };
};

const redirectToConfirmPage = (h, caseId, actionCode) =>
  h.redirect(confirmStageOutcomePath(caseId, actionCode));

const withPendingConfirmation = (
  request,
  h,
  caseId,
  actionCode,
  formData = {},
) => {
  const pendingState = resolvePendingConfirmation(
    request,
    caseId,
    actionCode,
    formData,
  );

  if (!pendingState.pendingConfirmation) {
    return {
      response: redirectToCaseWithExpiredMessage(request, h, caseId),
    };
  }

  return { pendingState };
};

const buildFormData = (payload, comment) => ({
  ...payload,
  comment,
});

const redirectWithConfirmationError = (
  request,
  h,
  caseId,
  actionCode,
  payload,
  comment,
) => {
  setFlashData(request, {
    errors: {
      confirmation: {
        text: "Select an option",
        href: "#confirmation",
      },
    },
    formData: buildFormData(payload, comment),
  });

  return redirectToConfirmPage(h, caseId, actionCode);
};

const redirectWithUpdateErrors = (
  request,
  h,
  caseId,
  actionCode,
  payload,
  comment,
  errors,
) => {
  setFlashData(request, {
    errors,
    formData: buildFormData(payload, comment),
  });

  return redirectToConfirmPage(h, caseId, actionCode);
};

const updateConfirmedStageOutcome = async (
  authContext,
  caseId,
  actionCode,
  comment,
) =>
  updateStageOutcomeUseCase(authContext, {
    caseId,
    actionData: {
      actionCode,
      commentFieldName: `${actionCode}-comment`,
      comment,
    },
  });

const handleConfirmedAction = async (
  request,
  h,
  authContext,
  caseId,
  actionCode,
  comment,
) => {
  const { errors } = await updateConfirmedStageOutcome(
    authContext,
    caseId,
    actionCode,
    comment,
  );

  if (!errors) {
    return null;
  }

  return redirectWithUpdateErrors(
    request,
    h,
    caseId,
    actionCode,
    request.payload,
    comment,
    errors,
  );
};

const processConfirmationDecision = async (
  request,
  h,
  authContext,
  caseId,
  actionCode,
  confirmation,
  comment,
) => {
  if (!confirmation) {
    return redirectWithConfirmationError(
      request,
      h,
      caseId,
      actionCode,
      request.payload,
      comment,
    );
  }

  if (confirmation !== "yes") {
    return null;
  }

  return handleConfirmedAction(
    request,
    h,
    authContext,
    caseId,
    actionCode,
    comment,
  );
};

export const viewConfirmStageOutcomeRoute = {
  method: "GET",
  path: "/cases/{caseId}/stage/outcome/confirm",
  async handler(request, h) {
    const { caseId } = request.params;
    const { actionCode } = request.query;

    logger.info(
      `Viewing confirmation page for case ${caseId}, action ${actionCode}`,
    );

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const { errors, formData } = getFlashData(request);
    const { pendingState, response } = withPendingConfirmation(
      request,
      h,
      caseId,
      actionCode,
      formData,
    );

    if (response) {
      return response;
    }

    const page = await findCaseByIdUseCase(authContext, caseId);

    const viewModel = createConfirmStageOutcomeViewModel({
      page,
      request,
      actionCode,
      formData: {
        ...formData,
        comment: pendingState.comment,
      },
      errors,
    });

    logger.info(
      `Finished: Viewing confirmation page for case ${caseId}, action ${actionCode}`,
    );

    return h.view("pages/confirm-stage-outcome", viewModel);
  },
};

export const confirmStageOutcomeRoute = {
  method: "POST",
  path: "/cases/{caseId}/stage/outcome/confirm",
  async handler(request, h) {
    const { caseId } = request.params;
    const { confirmation, actionCode } = request.payload;

    logger.info(
      `Processing confirmation for case ${caseId}, action ${actionCode}`,
    );

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const { pendingState, response } = withPendingConfirmation(
      request,
      h,
      caseId,
      actionCode,
    );

    if (response) {
      return response;
    }

    const responseFromDecision = await processConfirmationDecision(
      request,
      h,
      authContext,
      caseId,
      actionCode,
      confirmation,
      pendingState.comment,
    );

    if (responseFromDecision) {
      return responseFromDecision;
    }

    clearPendingStageOutcomeConfirmation(request, { caseId, actionCode });

    logger.info(
      `Finished: Processing confirmation for case ${caseId}, action ${actionCode}`,
    );

    return h.redirect(`/cases/${caseId}`);
  },
};

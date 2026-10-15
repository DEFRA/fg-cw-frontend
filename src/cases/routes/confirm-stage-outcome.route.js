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
import { updateStageOutcomeUseCase } from "../use-cases/update-stage-outcome.use-case.js";
import { createConfirmStageOutcomeViewModel } from "../view-models/confirm-stage-outcome.view-model.js";

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
  pendingConfirmation.comment ?? "";

const resolveComment = ({ formData = {}, actionCode, pendingConfirmation }) =>
  getCommentFromFormData(formData, `${actionCode}-comment`) ??
  getPendingComment(pendingConfirmation);

const createConfirmationRequiredErrors = () => ({
  confirmation: {
    text: "Select an option",
    href: "#confirmation",
  },
});

const submitConfirmation = async (
  authContext,
  { caseId, actionCode, confirmation, comment },
) => {
  if (!confirmation) {
    return createConfirmationRequiredErrors();
  }

  if (confirmation !== "yes") {
    return undefined;
  }

  const { errors } = await updateStageOutcomeUseCase(authContext, {
    caseId,
    actionData: {
      actionCode,
      commentFieldName: `${actionCode}-comment`,
      comment,
    },
  });

  return errors;
};

const redirectBackWithErrors = (
  request,
  h,
  { caseId, actionCode, comment, errors },
) => {
  setFlashData(request, {
    errors,
    formData: { ...request.payload, comment },
  });

  return h.redirect(
    `/cases/${caseId}/stage/outcome/confirm?actionCode=${actionCode}`,
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
    const pendingConfirmation = getPendingStageOutcomeConfirmation(request, {
      caseId,
      actionCode,
    });

    if (!pendingConfirmation) {
      return redirectToCaseWithExpiredMessage(request, h, caseId);
    }

    const page = await findCaseByIdUseCase(authContext, caseId);

    const viewModel = createConfirmStageOutcomeViewModel({
      page,
      request,
      actionCode,
      formData: {
        ...formData,
        comment: resolveComment({ formData, actionCode, pendingConfirmation }),
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

    const pendingConfirmation = getPendingStageOutcomeConfirmation(request, {
      caseId,
      actionCode,
    });

    if (!pendingConfirmation) {
      return redirectToCaseWithExpiredMessage(request, h, caseId);
    }

    const comment = getPendingComment(pendingConfirmation);
    const errors = await submitConfirmation(authContext, {
      caseId,
      actionCode,
      confirmation,
      comment,
    });

    if (errors) {
      return redirectBackWithErrors(request, h, {
        caseId,
        actionCode,
        comment,
        errors,
      });
    }

    clearPendingStageOutcomeConfirmation(request, { caseId, actionCode });

    logger.info(
      `Finished: Processing confirmation for case ${caseId}, action ${actionCode}`,
    );

    return h.redirect(`/cases/${caseId}`);
  },
};

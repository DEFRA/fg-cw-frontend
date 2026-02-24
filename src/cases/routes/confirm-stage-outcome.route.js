import {
  getFlashData,
  setFlashData,
} from "../../common/helpers/flash-helpers.js";
import { logger } from "../../common/logger.js";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { updateStageOutcomeUseCase } from "../use-cases/update-stage-outcome-use.case.js";
import { createConfirmStageOutcomeViewModel } from "../view-models/confirm-stage-outcome.view-model.js";

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

    const page = await findCaseByIdUseCase(authContext, caseId);

    const viewModel = createConfirmStageOutcomeViewModel({
      page,
      request,
      actionCode,
      formData,
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
    const { confirmation, actionCode, comment } = request.payload;

    logger.info(
      `Processing confirmation for case ${caseId}, action ${actionCode}`,
    );

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    if (!confirmation) {
      setFlashData(request, {
        errors: {
          confirmation: {
            text: "Select an option",
            href: "#confirmation",
          },
        },
        formData: request.payload,
      });
      return h.redirect(
        `/cases/${caseId}/stage/outcome/confirm?actionCode=${actionCode}`,
      );
    }

    if (confirmation === "yes") {
      const { errors } = await updateStageOutcomeUseCase(authContext, {
        caseId,
        actionData: {
          actionCode,
          commentFieldName: `${actionCode}-comment`,
          comment,
        },
      });

      if (errors) {
        setFlashData(request, {
          errors,
          formData: request.payload,
        });
        return h.redirect(
          `/cases/${caseId}/stage/outcome/confirm?actionCode=${actionCode}`,
        );
      }
    }

    logger.info(
      `Finished: Processing confirmation for case ${caseId}, action ${actionCode}`,
    );

    return h.redirect(`/cases/${caseId}`);
  },
};

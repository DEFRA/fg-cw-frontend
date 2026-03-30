import Boom from "@hapi/boom";
import { logger } from "../../common/logger.js";
import { updateStageOutcome } from "../repositories/case.repository.js";
import { findCaseByIdUseCase } from "./find-case-by-id.use-case.js";

export const updateStageOutcomeUseCase = async (
  authContext,
  { caseId, actionData },
) => {
  logger.info(`Updating stage outcome for case ${caseId}`);

  const actionCodeValidation = validateActionCode(actionData.actionCode);

  if (!actionCodeValidation.success) {
    return actionCodeValidation;
  }

  const page = await findCaseByIdUseCase(authContext, caseId);
  const validation = validateStageOutcomeAction(page.data, actionData);

  if (!validation.success) {
    return validation;
  }

  const { actionCode, comment } = actionData;

  await updateStageOutcome(authContext, {
    caseId,
    actionCode,
    comment,
  });

  logger.info(`Finished: Updating stage outcome for case ${caseId}`);

  return { success: true };
};

export const validateStageOutcomeAction = (caseData, actionData) => {
  const { actionCode, commentFieldName, comment } = actionData;

  const actionCodeValidation = validateActionCode(actionCode);

  if (!actionCodeValidation.success) {
    return actionCodeValidation;
  }

  const action = findSelectedAction(caseData, actionCode);

  if (validComment(action, comment)) {
    return { success: true };
  }

  return {
    success: false,
    errors: {
      [commentFieldName]: {
        text: `${action.comment.label} is required`,
        href: `#${commentFieldName}`,
      },
    },
  };
};

const validateActionCode = (actionCode) => {
  if (!actionCode) {
    return {
      success: false,
      errors: {
        actionCode: {
          text: "Choose an option",
          href: "#actionCode",
        },
      },
    };
  }

  return { success: true };
};

const findSelectedAction = (caseData, actionCode) => {
  const stage = caseData.stage;

  const action = stage?.actions.find((a) => a.code === actionCode);
  if (!action) {
    throw Boom.badRequest(`Invalid action selected: ${actionCode}`);
  }

  return action;
};

const validComment = (action, comment) => {
  if (!isRequired(action.comment)) {
    return true;
  }
  return typeof comment === "string" && comment.trim() !== "";
};

const isRequired = (comment) => comment?.mandatory;

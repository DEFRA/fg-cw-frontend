import Boom from "@hapi/boom";
import { updateStageOutcome } from "../repositories/case.repository.js";
import { findCaseByIdUseCase } from "./find-case-by-id.use-case.js";

export const updateStageOutcomeUseCase = async (
  authContext,
  { caseId, actionData: { actionId, commentFieldName, comment } },
) => {
  const caseData = await findCaseByIdUseCase(authContext, caseId);
  const action = findSelectedAction(caseData, actionId);

  if (validComment(action, comment)) {
    await updateStageOutcome(authContext, {
      caseId,
      actionId,
      comment,
    });

    return { success: true };
  } else {
    return {
      success: false,
      errors: {
        [commentFieldName]: {
          text: `${action.comment.label} is required`,
          href: `#${commentFieldName}`,
        },
      },
    };
  }
};

const findSelectedAction = (caseData, actionId) => {
  const stage = caseData.stages.find((s) => s.id === caseData.currentStage);
  const action = stage?.actions.find((a) => a.id === actionId);
  if (!action) {
    throw Boom.badRequest(`Invalid action selected: ${actionId}`);
  }

  return action;
};

const validComment = (action, comment) => {
  if (!isRequired(action.comment)) {
    return true;
  }
  return typeof comment === "string" && comment.trim() !== "";
};

const isRequired = (comment) => {
  return comment?.type === "REQUIRED";
};

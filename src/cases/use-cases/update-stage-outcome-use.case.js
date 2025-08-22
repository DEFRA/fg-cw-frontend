import { updateStageOutcome } from "../repositories/case.repository.js";
import { findCaseByIdUseCase } from "./find-case-by-id.use-case.js";

export const updateStageOutcomeUseCase = async (caseId, payload) => {
  const result = await validateStageAction(caseId, payload);

  if (result.success) {
    await updateStageOutcome({ caseId, ...result.actionData });
  }

  return result;
};

const extractStageActionPayload = (payload) => {
  const { actionId } = payload;
  const commentFieldName = `${actionId}-comment`;
  return {
    actionId,
    commentFieldName,
    comment: payload[commentFieldName],
  };
};

const validateStageAction = async (caseId, payload) => {
  const { actionId, comment, commentFieldName } =
    extractStageActionPayload(payload);

  const caseData = await findCaseByIdUseCase(caseId);
  const selectedAction = findSelectedAction(caseData, actionId);

  if (!selectedAction) {
    return {
      success: false,
      errors: {
        actionId: {
          text: "Invalid action selected",
          href: "#decision",
        },
      },
      caseData,
    };
  }

  const trimmed = comment?.trim();
  const errors = {};

  if (selectedAction.comment?.type === "REQUIRED" && !trimmed) {
    errors[commentFieldName] = {
      text: `${selectedAction.comment.label} is required`,
      href: `#${commentFieldName}`,
    };
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, caseData };
  }

  const actionData = { actionId };
  if (trimmed) {
    actionData.comment = trimmed;
  }

  return { success: true, actionData, caseData };
};

const findSelectedAction = (caseData, actionId) => {
  const stage = caseData.stages.find((s) => s.id === caseData.currentStage);
  return stage?.actions.find((a) => a.id === actionId);
};

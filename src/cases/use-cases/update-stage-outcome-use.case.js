import Boom from "@hapi/boom";
import { logger } from "../../common/logger.js";
import { updateStageOutcome } from "../repositories/case.repository.js";
import { findCaseByIdUseCase } from "./find-case-by-id.use-case.js";

export const updateStageOutcomeUseCase = async (
  authContext,
  { caseId, actionData: { actionCode, commentFieldName, comment } },
) => {
  logger.info(`Updating stage outcome for case ${caseId}`);

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

  const page = await findCaseByIdUseCase(authContext, caseId);
  const action = findSelectedAction(page.data, actionCode);

  if (validComment(action, comment)) {
    await updateStageOutcome(authContext, {
      caseId,
      actionCode,
      comment,
    });

    logger.info(`Finished: Updating stage outcome for case ${caseId}`);

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

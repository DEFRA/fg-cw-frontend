import { wreck } from "../../common/wreck.js";
import { logger } from "../../common/logger.js";

export const findSecretWorkflowUseCase = async (authContext, workflowCode) => {
  logger.debug(`Get secret workflow ${workflowCode}`);
  const res = await wreck.get(`/secret/workflow/${workflowCode}`, {
    headers: {
      Authorization: `Bearer ${authContext.token}`,
    },
  });

  logger.debug(`Finished: Get secret workflow ${workflowCode}`);

  return res.payload;
};

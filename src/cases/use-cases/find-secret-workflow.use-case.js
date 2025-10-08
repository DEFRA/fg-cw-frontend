import { wreck } from "../../common/wreck.js";

export const findSecretWorkflowUseCase = async (authContext, workflowCode) => {
  const res = await wreck.get(`/secret/workflow/${workflowCode}`, {
    headers: {
      Authorization: `Bearer ${authContext.token}`,
    },
  });

  return res.payload;
};

import { wreck } from "../../common/wreck.js";

export const findSecretWorkflowUseCase = async (token, workflowCode) => {
  const res = await wreck.get(`/secret/workflow/${workflowCode}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.payload;
};

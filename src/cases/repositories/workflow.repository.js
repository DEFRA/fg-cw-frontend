import { wreck } from "../../common/wreck.js";

export const findByCode = async (authContext, workflowCode) => {
  const { payload } = await wreck.get(`/workflows/${workflowCode}`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
  });

  return payload;
};

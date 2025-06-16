import { wreck } from "../../common/wreck.js";

export const findByCode = async (workflowCode) => {
  const { payload } = await wreck.get(`/workflows/${workflowCode}`);
  return payload;
};

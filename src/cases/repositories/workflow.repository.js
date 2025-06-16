import { wreck } from "../../server/common/helpers/wreck.js";

export const findByCode = async (workflowCode) => {
  const { payload } = await wreck.get(`/workflows/${workflowCode}`);
  return payload;
};

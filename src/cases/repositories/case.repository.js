import { wreck } from "../../server/common/helpers/wreck.js";

export const findAll = async () => {
  const { payload } = await wreck.get("/cases");
  return payload;
};

export const findById = async (caseId) => {
  const { payload } = await wreck.get(`/cases/${caseId}`);
  return payload;
};

export const updateStage = async (caseId) => {
  const { payload } = await wreck.post(`/cases/${caseId}/stage`);
  return payload;
};

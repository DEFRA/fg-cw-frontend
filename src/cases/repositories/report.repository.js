import { wreck } from "../../common/wreck.js";

const buildReportParams = ({ workflowCode } = {}) =>
  workflowCode ? `?${new URLSearchParams({ workflowCode })}` : "";

export const getReport = async (authContext, criteria) => {
  const params = buildReportParams(criteria);
  const { payload } = await wreck.get(`/cases/report${params}`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
  });

  return payload;
};

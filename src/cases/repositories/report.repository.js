import { wreck } from "../../common/wreck.js";

export const getReport = async (authContext, criteria) => {
  const params = criteria ? `?${new URLSearchParams(criteria)}` : "";
  const { payload } = await wreck.get(`/cases/report${params}`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
  });

  return payload;
};

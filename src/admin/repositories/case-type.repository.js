import { wreck } from "../../common/wreck.js";

export const getCaseTypes = async (authContext) => {
  const { payload } = await wreck.get("/case-types", {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
  });

  return payload;
};

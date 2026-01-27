import { wreck } from "../../common/wreck.js";

export const findAll = async (authContext) => {
  const { payload } = await wreck.get("/roles", {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
  });

  return payload;
};

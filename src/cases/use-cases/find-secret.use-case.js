import { wreck } from "../../common/wreck.js";

export const findSecretUseCase = async (authContext) => {
  const res = await wreck.get(`/secret`, {
    headers: {
      Authorization: `Bearer ${authContext.token}`,
    },
  });

  return res.payload;
};

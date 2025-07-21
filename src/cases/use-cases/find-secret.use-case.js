import { wreck } from "../../common/wreck.js";

export const findSecretUseCase = async (token) => {
  const res = await wreck.get(`/secret`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.payload;
};

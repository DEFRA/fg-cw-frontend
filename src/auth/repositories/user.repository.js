import { wreck } from "../../common/wreck.js";

export const findAll = async ({ idpId }) => {
  const { payload } = await wreck.get(`/users?idpId=${idpId}`);
  return payload;
};

export const create = async (userData) => {
  const { payload } = await wreck.post("/users", {
    payload: userData,
  });

  return payload;
};

export const update = async (id, userData) => {
  await wreck.patch(`/users/${id}`, {
    payload: userData,
  });
};

import { wreck } from "../../common/wreck.js";

export const findAll = async (authContext) => {
  const { payload } = await wreck.get("/roles", {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
  });

  return payload;
};

export const findByCode = async (authContext, roleCode) => {
  const { payload } = await wreck.get(`/roles/${roleCode}`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
  });

  return payload;
};

export const updateRole = async (authContext, roleCode, role) => {
  const { payload } = await wreck.put(`/roles/${roleCode}`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
    payload: role,
  });

  return payload;
};

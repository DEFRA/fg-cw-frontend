import { wreck } from "../../common/wreck.js";

export const findAll = async ({
  idpId,
  allAppRoles = [],
  anyAppRoles = [],
}) => {
  const query = createQuery({ idpId, allAppRoles, anyAppRoles });
  const { payload } = await wreck.get(`/users?${query}`);
  return payload;
};

const createQuery = ({ idpId, allAppRoles, anyAppRoles }) => {
  const query = new URLSearchParams();

  if (idpId) {
    query.append("idpId", idpId);
  }

  for (const role of allAppRoles) {
    query.append("allAppRoles", role);
  }

  for (const role of anyAppRoles) {
    query.append("anyAppRoles", role);
  }

  return query;
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

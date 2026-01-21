import { wreck } from "../../common/wreck.js";

export const adminFindById = async (authContext, id) => {
  const { payload } = await wreck.get(`/admin/users/${id}`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
  });
  return payload;
};

export const adminFindUsers = async (
  authContext,
  { idpId, allAppRoles = [], anyAppRoles = [] },
) => {
  const query = createQuery({ idpId, allAppRoles, anyAppRoles });

  const { payload } = await wreck.get(`/admin/users?${query}`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
  });

  return payload;
};

export const findAssignees = async (
  authContext,
  { allAppRoles = [], anyAppRoles = [] },
) => {
  const query = createQuery({ allAppRoles, anyAppRoles });

  const { payload } = await wreck.get(`/users/assignees?${query}`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
  });

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

export const login = async (authContext, userData) => {
  const { payload } = await wreck.post("/users/login", {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
    payload: userData,
  });

  return payload;
};

export const update = async (authContext, id, userData) => {
  const { payload } = await wreck.patch(`/users/${id}`, {
    headers: {
      authorization: `Bearer ${authContext.token}`,
    },
    payload: userData,
  });

  return payload;
};

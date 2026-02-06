import { updateRole } from "../repositories/roles.repository.js";

export const updateRoleUseCase = async (authContext, roleCode, role) => {
  return updateRole(authContext, roleCode, role);
};

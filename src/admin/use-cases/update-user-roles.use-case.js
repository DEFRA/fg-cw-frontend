import { update } from "../../auth/repositories/user.repository.js";

export const updateUserRolesUseCase = async (authContext, userId, appRoles) => {
  return update(authContext, userId, { appRoles });
};

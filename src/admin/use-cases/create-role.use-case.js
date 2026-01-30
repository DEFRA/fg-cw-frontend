import { create } from "../repositories/roles.repository.js";

export const createRoleUseCase = async (authContext, roleData) => {
  return create(authContext, roleData);
};

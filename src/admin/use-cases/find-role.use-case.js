import { findByCode } from "../repositories/roles.repository.js";

export const findRoleUseCase = async (authContext, roleCode) => {
  return findByCode(authContext, roleCode);
};

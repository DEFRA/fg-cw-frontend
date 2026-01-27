import { findAll } from "../repositories/roles.repository.js";

export const findRolesUseCase = async (authContext) => {
  return findAll(authContext);
};

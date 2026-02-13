import { adminFindById } from "../../auth/repositories/user.repository.js";
import { findAll } from "../repositories/roles.repository.js";

export const findUserRolesDataUseCase = async (authContext, userId) => {
  const [page, roles] = await Promise.all([
    adminFindById(authContext, userId),
    findAll(authContext),
  ]);

  return { page, roles };
};

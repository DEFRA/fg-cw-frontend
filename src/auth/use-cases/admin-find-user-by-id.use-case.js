import { adminFindById } from "../repositories/user.repository.js";

export const adminFindUserByIdUseCase = async (authContext, id) => {
  return adminFindById(authContext, id);
};

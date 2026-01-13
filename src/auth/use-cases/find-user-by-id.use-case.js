import { findById } from "../repositories/user.repository.js";

export const findUserByIdUseCase = async (authContext, id) => {
  return findById(authContext, id);
};

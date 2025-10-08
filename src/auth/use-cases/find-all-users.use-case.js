import { findAll } from "../repositories/user.repository.js";

export const findAllUsersUseCase = async (authContext, query) => {
  const users = await findAll(authContext, query);
  return users;
};

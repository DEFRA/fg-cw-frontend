import { findAll } from "../repositories/user.repository.js";

export const findAllUsersUseCase = async (query) => {
  const users = await findAll(query);
  return users;
};

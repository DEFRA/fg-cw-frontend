import { updateTaskStatus } from "../repositories/case.repository.js";

export const updateTaskStatusUseCase = async (authContext, taskDetails) => {
  return updateTaskStatus(authContext, taskDetails);
};

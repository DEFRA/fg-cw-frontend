import { updateTaskStatus } from "../repositories/case.repository.js";
export const updateTaskStatusUseCase = async (data) => {
  return updateTaskStatus(data);
};

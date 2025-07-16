import { assignUserToCase } from "../repositories/case.repository.js";

export const assignUserToCaseUseCase = async (data) => {
  if (data.assignedUserId === "") {
    data.assignedUserId = null;
  }

  return assignUserToCase(data);
};

import { assignUserToCase } from "../repositories/case.repository.js";

export const assignUserToCaseUseCase = async (authContext, data) => {
  if (data.assignedUserId === "") {
    data.assignedUserId = null;
  }

  return assignUserToCase(authContext, data);
};

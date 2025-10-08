import { addNoteToCase } from "../repositories/case.repository.js";

export const addNoteToCaseUseCase = async (authContext, data) => {
  return addNoteToCase(authContext, data);
};

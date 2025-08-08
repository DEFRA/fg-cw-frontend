import { addNoteToCase } from "../repositories/case.repository.js";

export const addNoteToCaseUseCase = async (data) => {
  return addNoteToCase(data);
};

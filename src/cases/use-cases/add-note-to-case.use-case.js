import { addNoteToCase } from "../repositories/case.repository.js";
import { logger } from "../../common/logger.js";

export const addNoteToCaseUseCase = async (authContext, data) => {
  logger.debug(`Adding note to case ${data.caseId}`);
  return addNoteToCase(authContext, data);
};

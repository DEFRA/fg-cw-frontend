import { logger } from "../../common/logger.js";
import { addNoteToCase } from "../repositories/case.repository.js";

export const addNoteToCaseUseCase = async (authContext, data) => {
  logger.info(`Adding note to case ${data.caseId}`);

  const result = await addNoteToCase(authContext, data);

  logger.info(`Finished: Adding note to case ${data.caseId}`);

  return result;
};

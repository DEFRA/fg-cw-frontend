import { findById } from "../repositories/case.repository.js";
import { logger } from "../../common/logger.js";

export const findCaseByIdUseCase = async (authContext, caseId) => {
  logger.info(`Finding case ${caseId}`);

  const result = await findById(authContext, caseId);

  logger.info(`Finished: Finding case ${caseId}`);

  return result;
};

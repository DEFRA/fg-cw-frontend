import { findById } from "../repositories/case.repository.js";
import { logger } from "../../common/logger.js";

export const findCaseByIdUseCase = async (authContext, caseId) => {
  logger.debug(`Finding case ${caseId}`);

  return await findById(authContext, caseId);
};

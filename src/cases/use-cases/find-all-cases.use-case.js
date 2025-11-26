import { findAll } from "../repositories/case.repository.js";
import { logger } from "../../common/logger.js";

export const findAllCasesUseCase = async (authContext) => {
  logger.debug("Finding all cases");
  const cases = await findAll(authContext);
  logger.debug("Finished: Finding all cases");
  return cases;
};

import { logger } from "../../common/logger.js";
import { findAll } from "../repositories/case.repository.js";

export const findAllCasesUseCase = async (authContext, query) => {
  logger.info("Finding all cases");
  const cases = await findAll(authContext, query);
  logger.info("Finished: Finding all cases");
  return cases;
};

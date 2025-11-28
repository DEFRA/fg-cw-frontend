import { findAll } from "../repositories/case.repository.js";
import { logger } from "../../common/logger.js";

export const findAllCasesUseCase = async (authContext) => {
  logger.info("Finding all cases");
  const cases = await findAll(authContext);
  logger.info("Finished: Finding all cases");
  return cases;
};

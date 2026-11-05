import { logger } from "../../common/logger.js";
import { getCaseTypes } from "../repositories/case-type.repository.js";

export const getCaseTypesUseCase = async (authContext) => {
  logger.info("Getting case types");
  const page = await getCaseTypes(authContext);
  logger.info("Finished: Getting case types");
  return page;
};

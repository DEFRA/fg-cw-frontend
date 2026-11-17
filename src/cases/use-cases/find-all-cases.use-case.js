import { logger } from "../../common/logger.js";
import { findAll } from "../repositories/case.repository.js";
import { toCaseListCriteria } from "./to-case-list-criteria.js";

export const findAllCasesUseCase = async (authContext, query = {}) => {
  logger.info("Finding all cases");
  const cases = await findAll(
    authContext,
    toCaseListCriteria(query, {
      cursor: query.cursor,
      direction: query.direction,
    }),
  );
  logger.info("Finished: Finding all cases");
  return cases;
};

import { logger } from "../../common/logger.js";
import { getReport } from "../repositories/report.repository.js";

export const reportCasesUseCase = async (authContext, query) => {
  logger.info("Building case report");
  const report = await getReport(authContext, query);
  logger.info("Finished: Building case report");
  return report;
};

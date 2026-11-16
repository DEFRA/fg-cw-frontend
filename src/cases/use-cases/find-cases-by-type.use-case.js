import Boom from "@hapi/boom";
import { logger } from "../../common/logger.js";
import { findByCaseType } from "../repositories/case.repository.js";

const errorMap = {
  404: (caseType) => Boom.notFound(`Case type "${caseType}" not found`),
  403: (caseType) =>
    Boom.forbidden(
      `You do not have the required roles for case type "${caseType}"`,
    ),
};

const mapBackendError = (error, caseType) => {
  const statusCode = error.output?.statusCode;
  const factory = errorMap[statusCode];
  return factory ? factory(caseType) : error;
};

export const findCasesByTypeUseCase = async (authContext, caseType, query) => {
  logger.info(`Finding cases for type ${caseType}`);

  try {
    return await findByCaseType(authContext, caseType, query);
  } catch (error) {
    throw mapBackendError(error, caseType);
  }
};

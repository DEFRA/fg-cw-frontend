import { authFailureDetails } from "../../common/auth-failure-details.js";
import { logger } from "../../common/logger.js";

const diagnosticCode = (details) => {
  const entraCode = details.entraErrorCodes?.length
    ? `AADSTS${details.entraErrorCodes[0]}`
    : details.entraError;
  return details.networkErrorCode ?? entraCode;
};

export const logAuthFailureUseCase = (error) => {
  const details = authFailureDetails(error);
  logger.warn(
    {
      error: {
        type: "EntraAuthenticationError",
        code: diagnosticCode(details),
        message: "Entra callback authentication failed",
      },
      // CDP only ingests its supported ECS fields; tenant.message carries
      // custom diagnostics as text. Do not attach raw auth errors here.
      tenant: { message: JSON.stringify(details) },
    },
    "Entra callback authentication failed",
  );
};

import { statusCodes } from "../status-codes.js";

export const hasValidationErrors = (errors) =>
  Object.values(errors).some(Boolean);

export const isForbidden = (error) =>
  error?.output?.statusCode === statusCodes.FORBIDDEN;

export const isConflict = (error) => {
  const statusCodesToCheck = [error?.output?.statusCode, error?.statusCode];

  return statusCodesToCheck.includes(statusCodes.CONFLICT);
};

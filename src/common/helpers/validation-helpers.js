import { statusCodes } from "../status-codes.js";

export const hasValidationErrors = (errors) =>
  Object.values(errors).some(Boolean);

export const isForbidden = (error) =>
  error?.output?.statusCode === statusCodes.FORBIDDEN;

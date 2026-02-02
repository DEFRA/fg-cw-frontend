import { statusCodes } from "../status-codes.js";

export const addError = (errors, key, message) => {
  if (message) {
    errors[key] = message;
  }
};

export const hasValidationErrors = (errors) => Object.keys(errors).length > 0;

export const isForbidden = (error) =>
  error?.output?.statusCode === statusCodes.FORBIDDEN;

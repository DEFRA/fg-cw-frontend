import { toStringOrEmpty } from "./string-helpers.js";

const ROLE_DESCRIPTION_REQUIRED_MESSAGE = "Enter a role description";
const ROLE_ASSIGNABLE_REQUIRED_MESSAGE =
  "Select whether the role is assignable";
const ASSIGNABLE_ALLOWED_VALUES = ["true", "false"];

const requiredField = (message) => (value) =>
  toStringOrEmpty(value) === "" ? message : null;

const requiredBoolean = (message, allowedValues) => (value) =>
  allowedValues.includes(toStringOrEmpty(value)) ? null : message;

export const validateRoleDescription = requiredField(
  ROLE_DESCRIPTION_REQUIRED_MESSAGE,
);

export const validateRoleAssignable = requiredBoolean(
  ROLE_ASSIGNABLE_REQUIRED_MESSAGE,
  ASSIGNABLE_ALLOWED_VALUES,
);

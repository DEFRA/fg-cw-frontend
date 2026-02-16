import { format, isBefore, isValid } from "date-fns";

import { parseDate } from "../../common/helpers/date-helpers.js";
import {
  buildRoleDateKeys,
  normaliseRoleCodes,
} from "../../common/helpers/role-helpers.js";
import { toStringOrEmpty } from "../../common/helpers/string-helpers.js";

const INVALID_START_DATE_MESSAGE = "Invalid Start Date";
const INVALID_END_DATE_MESSAGE = "Invalid End Date";
const END_BEFORE_START_MESSAGE = "End date cannot be before start date";

export const buildUserRolesUseCase = ({ formData } = {}) => {
  const safeFormData = formData ?? {};
  const selectedCodes = normaliseRoleCodes(safeFormData.roles);
  const result = { appRoles: {}, errors: {} };

  for (const code of selectedCodes) {
    const roleMapping = mapRoleFromForm({
      code,
      formData: safeFormData,
    });
    result.appRoles[code] = roleMapping.allocation;
    Object.assign(result.errors, roleMapping.errors);
  }

  return result;
};

const mapRoleFromForm = ({ code, formData }) => {
  const { startKey, endKey } = buildRoleDateKeys(code);

  const startRaw = toStringOrEmpty(formData[startKey]);
  const endRaw = toStringOrEmpty(formData[endKey]);

  const errors = buildRoleErrors({
    startKey,
    endKey,
    startRaw,
    endRaw,
  });
  const allocation = buildAllocation({ startRaw, endRaw });

  return { allocation, errors };
};

const buildRoleErrors = ({ startKey, endKey, startRaw, endRaw }) => {
  const startError = getDateError({
    rawDate: startRaw,
    message: INVALID_START_DATE_MESSAGE,
  });
  const endError = getDateError({
    rawDate: endRaw,
    message: INVALID_END_DATE_MESSAGE,
  });
  const dateOrderError = getDateOrderErrorEntry({
    endKey,
    startRaw,
    endRaw,
  });

  const errors = {};

  if (startError) {
    errors[startKey] = startError;
  }

  if (endError) {
    errors[endKey] = endError;
  }

  if (dateOrderError) {
    errors[dateOrderError.key] = dateOrderError.message;
  }

  return errors;
};

const getDateError = ({ rawDate, message }) => {
  if (!rawDate) {
    return null;
  }

  if (isValid(parseDate(rawDate))) {
    return null;
  }

  return message;
};

const getDateOrderErrorEntry = ({ endKey, startRaw, endRaw }) => {
  if (!hasProvidedDates(startRaw, endRaw)) {
    return null;
  }

  const startDate = parseDate(startRaw);
  const endDate = parseDate(endRaw);

  if (!hasValidDates(startDate, endDate)) {
    return null;
  }

  if (!isBefore(endDate, startDate)) {
    return null;
  }

  return {
    key: endKey,
    message: END_BEFORE_START_MESSAGE,
  };
};

const hasProvidedDates = (startRaw, endRaw) => Boolean(startRaw && endRaw);

const hasValidDates = (startDate, endDate) =>
  Boolean(isValid(startDate) && isValid(endDate));

const buildAllocation = ({ startRaw, endRaw }) => {
  const allocation = {};
  const startDate = getFormattedDateOrNull(startRaw);
  const endDate = getFormattedDateOrNull(endRaw);

  if (startDate) {
    allocation.startDate = startDate;
  }

  if (endDate) {
    allocation.endDate = endDate;
  }

  return allocation;
};

const getFormattedDateOrNull = (rawDate) => {
  if (!rawDate) {
    return null;
  }

  const parsedDate = parseDate(rawDate);
  if (!isValid(parsedDate)) {
    return null;
  }

  return format(parsedDate, "yyyy-MM-dd");
};

import { format, isBefore, isValid, parse, parseISO } from "date-fns";

import { findUserByIdUseCase } from "../../../auth/use-cases/find-user-by-id.use-case.js";
import { logger } from "../../../common/logger.js";
import { statusCodes } from "../../../common/status-codes.js";
import { findRolesUseCase } from "../../use-cases/find-roles.use-case.js";
import { updateUserRolesUseCase } from "../../use-cases/update-user-roles.use-case.js";
import { createUserRolesViewModel } from "../../view-models/user-management/user-roles.view-model.js";

const SAVE_ERROR_MESSAGE = "There was a problem saving roles. Please try again.";

export const saveUserRolesRoute = {
  method: "POST",
  path: "/admin/user-management/{id}/roles",
  async handler(request, h) {
    const userId = request.params.id;

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const formData = request.payload || {};

    const { user, roles } = await loadPageData(authContext, userId);
    const selectedRoleCodes = normaliseRoleCodes(formData.roles);

    const { appRoles, errors } = buildAppRolesFromForm(selectedRoleCodes, formData);
    if (hasValidationErrors(errors)) {
      return renderRolesPage(h, { user, roles, userId, errors, formData });
    }

    return await persistRolesOrRenderError(request, h, {
      authContext,
      user,
      roles,
      userId,
      appRoles,
      formData,
    });
  },
};

const loadPageData = async (authContext, userId) => {
  const [user, roles] = await Promise.all([
    findUserByIdUseCase(authContext, userId),
    findRolesUseCase(authContext),
  ]);

  return { user, roles };
};

const persistRolesOrRenderError = async (
  request,
  h,
  { authContext, user, roles, userId, appRoles, formData },
) => {
  try {
    logger.info(`Saving user roles ${userId}`);
    await updateUserRolesUseCase(authContext, userId, appRoles);
    logger.info(`Finished: Saving user roles ${userId}`);
    return h.redirect(`/admin/user-management/${userId}`);
  } catch (error) {
    request.log("error", {
      message: "Failed to save user roles",
      userId,
      error: error.message,
      stack: error.stack,
    });

    if (isForbidden(error)) {
      throw error;
    }

    return renderRolesPage(h, {
      user,
      roles,
      userId,
      errors: { save: SAVE_ERROR_MESSAGE },
      formData,
    });
  }
};

const renderRolesPage = (h, { user, roles, userId, errors, formData }) => {
  const viewModel = createUserRolesViewModel({
    user,
    roles,
    userId,
    errors,
    formData,
  });

  return h.view("pages/user-management/user-roles", viewModel);
};

const hasValidationErrors = (errors) => Object.keys(errors).length > 0;

const buildAppRolesFromForm = (selectedRoleCodes, formData) => {
  const errors = {};
  const appRoles = {};

  for (const code of selectedRoleCodes) {
    const roleResult = buildRoleAllocationResult(code, formData);
    appRoles[code] = roleResult.allocation;
    Object.assign(errors, roleResult.errors);
  }

  return { appRoles, errors };
};

const buildRoleAllocationResult = (code, formData) => {
  const { startKey, endKey } = buildRoleDateKeys(code);

  const startDateRaw = toStringOrEmpty(formData[startKey]);
  const endDateRaw = toStringOrEmpty(formData[endKey]);

  const startDate = startDateRaw.trim();
  const endDate = endDateRaw.trim();

  const start = parseDateIfPresent(startDate);
  const end = parseDateIfPresent(endDate);

  const errors = collectRoleErrors({ startKey, endKey, startDate, endDate, start, end });
  const allocation = buildAllocation({ startDate, endDate, start, end });

  return { allocation, errors };
};

const parseDateIfPresent = (value) => {
  if (!value) {
    return null;
  }

  return parseFlexibleDate(value);
};

const collectRoleErrors = ({ startKey, endKey, startDate, endDate, start, end }) => {
  const errors = {};

  Object.assign(errors, validateStartDate(startKey, startDate, start));
  Object.assign(errors, validateEndDate(endKey, endDate, end));
  Object.assign(errors, validateDateOrder(endKey, startDate, endDate, start, end));

  return errors;
};

const validateStartDate = (startKey, startDate, start) => {
  const errors = {};

  if (!startDate) {
    return errors;
  }

  if (!isValidDate(start)) {
    errors[startKey] = "Invalid Start Date";
  }

  return errors;
};

const validateEndDate = (endKey, endDate, end) => {
  const errors = {};

  if (!endDate) {
    return errors;
  }

  if (!isValidDate(end)) {
    errors[endKey] = "Invalid End Date";
  }

  return errors;
};

const validateDateOrder = (endKey, startDate, endDate, start, end) => {
  const errors = {};

  if (!shouldValidateDateOrder(startDate, endDate, start, end)) {
    return errors;
  }

  if (isBefore(end, start)) {
    errors[endKey] = "End date before start date";
  }

  return errors;
};

const shouldValidateDateOrder = (startDate, endDate, start, end) => {
  return Boolean(startDate && endDate && isValidDate(start) && isValidDate(end));
};

const buildAllocation = ({ startDate, endDate, start, end }) => {
  const allocation = {};

  persistStartDate(allocation, startDate, start);
  persistEndDate(allocation, endDate, end);

  return allocation;
};

const persistStartDate = (allocation, startDate, start) => {
  if (!startDate) {
    return;
  }

  if (!isValidDate(start)) {
    return;
  }

  allocation.startDate = formatDateOnly(start);
};

const persistEndDate = (allocation, endDate, end) => {
  if (!endDate) {
    return;
  }

  if (!isValidDate(end)) {
    return;
  }

  allocation.endDate = formatDateOnly(end);
};

const formatDateOnly = (date) => format(date, "yyyy-MM-dd");

const isValidDate = (value) => {
  if (!value) {
    return false;
  }

  return isValid(value);
};

const buildRoleDateKeys = (code) => ({
  startKey: `startDate__${code}`,
  endKey: `endDate__${code}`,
});

const normaliseRoleCodes = (roles) => {
  if (!roles) {
    return [];
  }

  if (Array.isArray(roles)) {
    return roles;
  }

  return [roles];
};

const parseFlexibleDate = (raw) => {
  const iso = parseISO(raw);
  if (isValid(iso)) {
    return iso;
  }

  const dmy = parse(raw, "dd MMM yyyy", new Date());
  if (isValid(dmy)) {
    return dmy;
  }

  const dmySingle = parse(raw, "d MMM yyyy", new Date());
  if (isValid(dmySingle)) {
    return dmySingle;
  }

  return null;
};

const toStringOrEmpty = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
};

const isForbidden = (error) => error?.output?.statusCode === statusCodes.FORBIDDEN;

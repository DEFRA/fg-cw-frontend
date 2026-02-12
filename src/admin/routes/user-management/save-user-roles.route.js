import { format, isBefore, isValid } from "date-fns";

import { adminFindUserByIdUseCase } from "../../../auth/use-cases/admin-find-user-by-id.use-case.js";
import { parseDate } from "../../../common/helpers/date-helpers.js";
import {
  buildRoleDateKeys,
  normaliseRoleCodes,
} from "../../../common/helpers/role-helpers.js";
import { toStringOrEmpty } from "../../../common/helpers/string-helpers.js";
import {
  hasValidationErrors,
  isForbidden,
} from "../../../common/helpers/validation-helpers.js";
import { logger } from "../../../common/logger.js";
import { findRolesUseCase } from "../../use-cases/find-roles.use-case.js";
import { updateUserRolesUseCase } from "../../use-cases/update-user-roles.use-case.js";
import { createUserRolesViewModel } from "../../view-models/user-management/user-roles.view-model.js";

const SAVE_ERROR_MESSAGE =
  "There was a problem saving roles. Please try again.";

export const saveUserRolesRoute = {
  method: "POST",
  path: "/admin/user-management/users/{id}/roles",
  async handler(request, h) {
    const userId = request.params.id;

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const { page, roles } = await loadPageData(authContext, userId);

    const formData = request.payload || {};
    const selectedRoleCodes = normaliseRoleCodes(formData.roles);

    const { appRoles, errors } = buildAppRolesFromForm({
      selectedRoleCodes,
      formData,
      currentAppRoles: page?.data?.appRoles,
    });

    return await saveRoles(request, h, {
      authContext,
      page,
      roles,
      userId,
      appRoles,
      errors,
      formData,
    });
  },
};

const loadPageData = async (authContext, userId) => {
  const [page, roles] = await Promise.all([
    adminFindUserByIdUseCase(authContext, userId),
    findRolesUseCase(authContext),
  ]);

  return { page, roles };
};

const saveRolesOrRenderError = async (
  request,
  h,
  { authContext, page, roles, userId, appRoles, formData },
) => {
  try {
    logger.info(`Saving user roles ${userId}`);
    await updateUserRolesUseCase(authContext, userId, appRoles);
    logger.info(`Finished: Saving user roles ${userId}`);
    return h.redirect(`/admin/user-management/users/${userId}`);
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
      page,
      request,
      roles,
      userId,
      errors: { save: SAVE_ERROR_MESSAGE },
      formData,
    });
  }
};

const renderRolesPage = (
  h,
  { page, request, roles, userId, errors, formData },
) => {
  const viewModel = createUserRolesViewModel({
    page,
    request,
    roles,
    userId,
    errors,
    formData,
  });

  return h.view("pages/user-management/user-roles", viewModel);
};

const buildAppRolesFromForm = ({
  selectedRoleCodes,
  formData,
  currentAppRoles,
}) => {
  const errors = {};
  const appRoles = {};

  for (const code of selectedRoleCodes) {
    const roleResult = buildRoleAllocationResult({
      code,
      formData,
      currentRoleAllocation: currentAppRoles?.[code],
    });
    appRoles[code] = roleResult.allocation;
    Object.assign(errors, roleResult.errors);
  }

  return { appRoles, errors };
};

const buildRoleAllocationResult = ({
  code,
  formData,
  currentRoleAllocation,
}) => {
  const { startKey, endKey } = buildRoleDateKeys(code);

  const startDate = toStringOrEmpty(formData[startKey]);
  const endDate = toStringOrEmpty(formData[endKey]);

  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const errors = collectRoleErrors({
    startKey,
    endKey,
    startDate,
    endDate,
    start,
    end,
    currentRoleAllocation,
  });
  const allocation = buildAllocation({ startDate, endDate, start, end });

  return { allocation, errors };
};

const collectRoleErrors = ({
  startKey,
  endKey,
  startDate,
  endDate,
  start,
  end,
  currentRoleAllocation,
}) => {
  const errors = {};

  Object.assign(errors, validateStartDate(startKey, startDate, start));
  Object.assign(errors, validateEndDate(endKey, endDate, end));
  Object.assign(
    errors,
    validateDateOrder({
      startKey,
      endKey,
      startDate,
      endDate,
      start,
      end,
      currentRoleAllocation,
    }),
  );

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

const validateDateOrder = ({
  startKey,
  endKey,
  startDate,
  endDate,
  start,
  end,
  currentRoleAllocation,
}) => {
  const errors = {};

  if (!shouldValidateDateOrder(startDate, endDate, start, end)) {
    return errors;
  }

  if (isBefore(end, start)) {
    const errorField = determineDateOrderErrorField({
      startKey,
      endKey,
      startDate,
      endDate,
      currentRoleAllocation,
    });
    errors[errorField] =
      errorField === startKey
        ? "Start date cannot be after end date"
        : "End date cannot be before start date";
  }

  return errors;
};

const determineDateOrderErrorField = ({
  startKey,
  endKey,
  startDate,
  endDate,
  currentRoleAllocation,
}) => {
  const { previousStartDate, previousEndDate } = getCurrentRoleDates(
    currentRoleAllocation,
  );
  const startChanged = startDate !== previousStartDate;
  const endChanged = endDate !== previousEndDate;

  if (!startChanged) {
    return endKey;
  }

  if (endChanged) {
    return endKey;
  }

  return startKey;
};

const getCurrentRoleDates = (currentRoleAllocation) => ({
  previousStartDate: toStringOrEmpty(currentRoleAllocation?.startDate),
  previousEndDate: toStringOrEmpty(currentRoleAllocation?.endDate),
});

const shouldValidateDateOrder = (startDate, endDate, start, end) => {
  return Boolean(
    startDate && endDate && isValidDate(start) && isValidDate(end),
  );
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

const saveRoles = async (
  request,
  h,
  { authContext, page, roles, userId, appRoles, errors, formData },
) => {
  if (hasValidationErrors(errors)) {
    return renderRolesPage(h, {
      page,
      request,
      roles,
      userId,
      errors,
      formData,
    });
  }

  return await saveRolesOrRenderError(request, h, {
    authContext,
    page,
    roles,
    userId,
    appRoles,
    formData,
  });
};

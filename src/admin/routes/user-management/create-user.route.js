import { adminCreateUserUseCase } from "../../../auth/use-cases/admin-create-user.use-case.js";
import { verifyAdminAccessUseCase } from "../../../auth/use-cases/verify-admin-access.use-case.js";
import { toStringOrEmpty } from "../../../common/helpers/string-helpers.js";
import {
  hasValidationErrors,
  isForbidden,
} from "../../../common/helpers/validation-helpers.js";
import { logger } from "../../../common/logger.js";
import { statusCodes } from "../../../common/status-codes.js";
import { createCreateUserViewModel } from "../../view-models/user-management/create-user.view-model.js";

// Using a possessive-style regex pattern to prevent ReDoS
const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

export const createUserRoute = {
  method: "POST",
  path: "/admin/user-management/users",
  async handler(request, h) {
    logger.info("Creating new user");

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const page = await verifyAdminAccessUseCase(authContext);

    const formData = request.payload || {};
    const errors = validateForm(formData);

    if (hasValidationErrors(errors)) {
      return renderCreateUserPage(h, { page, request, errors, formData });
    }

    const userData = mapFormData(formData);
    return createUser(request, h, {
      authContext,
      page,
      userData,
      formData,
    });
  },
};

const validateForm = ({ name, email }) => {
  return {
    name: validateName(name),
    email: validateEmail(email),
  };
};

const mapFormData = ({ name, email }) => {
  return {
    name: toStringOrEmpty(name),
    email: toStringOrEmpty(email),
  };
};

const renderCreateUserPage = (h, { page, request, errors, formData }) => {
  const viewModel = createCreateUserViewModel({
    page,
    request,
    errors,
    formData,
  });

  return h.view("pages/user-management/create-user", viewModel);
};

const createUser = async (
  request,
  h,
  { authContext, page, userData, formData },
) => {
  try {
    const response = await adminCreateUserUseCase(authContext, userData);
    const createdUser = response.data;
    logger.info(`Finished: Creating user with id ${createdUser.id}`);
    return h.redirect(`/admin/user-management/users/${createdUser.id}`);
  } catch (error) {
    return handleCreateUserError(request, h, {
      page,
      formData,
      userData,
      error,
    });
  }
};

const validateName = (value) => {
  const trimmed = toStringOrEmpty(value);
  if (trimmed === "") {
    return "Enter a name";
  }
  if (trimmed.length < 2) {
    return "Enter a name with at least 2 characters";
  }
  return null;
};

const validateEmail = (value) => {
  const trimmed = toStringOrEmpty(value);
  if (trimmed === "") {
    return "Enter an email address";
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return "Enter a valid email address";
  }
  return null;
};

const handleCreateUserError = (
  request,
  h,
  { page, formData, userData, error },
) => {
  logger.error({
    message: "Failed to create user",
    email: userData.email,
    error: error.message,
    stack: error.stack,
  });

  if (isForbidden(error)) {
    throw error;
  }

  const errors = buildErrorsFromFailure(error);

  return renderCreateUserPage(h, { page, request, errors, formData });
};

const isConflict = (error) => {
  const statusCodesToCheck = [error?.output?.statusCode, error?.statusCode];

  return statusCodesToCheck.includes(statusCodes.CONFLICT);
};

const buildErrorsFromFailure = (error) => {
  if (isConflict(error)) {
    return { email: "A user with this email address already exists" };
  }

  return { save: "There was a problem creating the user. Please try again." };
};

import { adminCreateUserUseCase } from "../../../auth/use-cases/admin-create-user.use-case.js";
import { logger } from "../../../common/logger.js";
import { statusCodes } from "../../../common/status-codes.js";
import { createCreateUserViewModel } from "../../view-models/user-management/create-user.view-model.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getCreateUserRoute = {
  method: "GET",
  path: "/admin/user-management/create",
  handler: async (_request, h) => {
    const viewModel = createCreateUserViewModel(null, null);
    return h.view("pages/user-management/create-user", viewModel);
  },
};

export const postCreateUserRoute = {
  method: "POST",
  path: "/admin/user-management/create",
  handler: async (request, h) => {
    const { name, email } = request.payload;
    const authContext = getAuthContext(request);

    const validationErrors = validateForm({ name, email });
    if (validationErrors) {
      return renderFormWithError(h, validationErrors, request.payload);
    }

    return createUser(request, h, authContext, { name, email });
  },
};

const getAuthContext = (request) => ({
  token: request.auth.credentials.token,
  user: request.auth.credentials.user,
});

const createUser = async (request, h, authContext, { name, email }) => {
  try {
    logger.info("Creating user via admin");
    const response = await adminCreateUserUseCase(authContext, { name, email });
    const createdUser = response.data;
    logger.info(`Finished: Creating user via admin with id ${createdUser.id}`);
    return h.redirect(`/admin/user-management/${createdUser.id}`);
  } catch (error) {
    return handleCreateError(request, h, error);
  }
};

const handleCreateError = (request, h, error) => {
  request.log("error", {
    message: "Failed to create user",
    error: error.message,
    stack: error.stack,
  });

  if (isForbidden(error)) {
    throw error;
  }

  if (isConflict(error)) {
    return renderFormWithError(
      h,
      { email: "A user with this email address already exists" },
      request.payload,
    );
  }

  return renderFormWithError(
    h,
    { save: "There was a problem creating the user. Please try again." },
    request.payload,
  );
};

const validateName = (name) => {
  if (!name || name.trim() === "") {
    return "Enter a name";
  }
  if (name.trim().length < 2) {
    return "Enter a name with at least 2 characters";
  }
  return null;
};

const validateEmail = (email) => {
  if (!email || email.trim() === "") {
    return "Enter an email address";
  }
  if (!EMAIL_REGEX.test(email)) {
    return "Enter a valid email address";
  }
  return null;
};

const validateForm = ({ name, email }) => {
  const errors = {};
  const nameError = validateName(name);
  const emailError = validateEmail(email);

  if (nameError) errors.name = nameError;
  if (emailError) errors.email = emailError;

  return Object.keys(errors).length > 0 ? errors : null;
};

const renderFormWithError = (h, errors, formData) => {
  const viewModel = createCreateUserViewModel(errors, formData);
  return h.view("pages/user-management/create-user", viewModel);
};

const isForbidden = (error) =>
  error?.output?.statusCode === statusCodes.FORBIDDEN;

const isConflict = (error) =>
  error?.output?.statusCode === statusCodes.CONFLICT;

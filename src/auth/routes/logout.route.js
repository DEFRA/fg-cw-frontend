import { logger } from "../../common/logger.js";
import { logoutUserUseCase } from "../use-cases/logout-user.use-case.js";

const auditLogout = async (token, userId) => {
  try {
    await logoutUserUseCase({ token }, { userId });
  } catch (error) {
    // Logout auditing is best-effort - never block the user from logging out.
    logger.error(error, `Failed to record logout audit for user ${userId}`);
  }
};

const recordLogout = async (request) => {
  const credentials = request.yar.get("credentials");
  const userId = credentials?.user?.id;

  if (userId) {
    await auditLogout(credentials.token, userId);
  }
};

export const logoutRoute = {
  method: "GET",
  path: "/logout",
  options: {
    auth: false,
  },
  handler: async (request, h) => {
    await recordLogout(request);

    request.yar.reset();

    return h.redirect("/");
  },
};

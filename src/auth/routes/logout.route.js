import { logger } from "../../common/logger.js";
import { logoutUserUseCase } from "../use-cases/logout-user.use-case.js";

const recordLogout = async (request) => {
  const credentials = request.yar.get("credentials");
  const userId = credentials?.user?.id;

  if (!userId) {
    return;
  }

  try {
    await logoutUserUseCase({ token: credentials.token }, { userId });
  } catch (error) {
    // Logout auditing is best-effort - never block the user from logging out.
    logger.error(error, `Failed to record logout audit for user ${userId}`);
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

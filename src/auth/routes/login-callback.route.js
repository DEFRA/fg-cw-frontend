import Boom from "@hapi/boom";
import { createOrUpdateUserUseCase } from "../use-cases/create-or-update-user.use-case.js";
import { logger } from "../../common/logger.js";

export const loginCallbackRoute = {
  method: "GET",
  path: "/login/callback",
  options: {
    auth: {
      mode: "try",
      strategy: "entra",
    },
  },
  async handler(request, h) {
    logger.info("Login callback route invoked");
    const { auth } = request;

    if (!auth.isAuthenticated) {
      throw Boom.forbidden(`Authentication failed: ${auth.error.message}`);
    }

    const authContext = {
      token: auth.credentials.token,
      profile: auth.credentials.profile,
    };

    const user = await createOrUpdateUserUseCase(authContext);

    request.yar.set("credentials", {
      token: auth.credentials.token,
      refreshToken: auth.credentials.refreshToken,
      expiresAt: Date.now() + auth.credentials.expiresIn * 1000,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        idpRoles: user.idpRoles,
        appRoles: user.appRoles,
      },
    });

    logger.info("Finished: Login callback route invoked");

    return h.redirect(auth.credentials.query.next ?? "/");
  },
};

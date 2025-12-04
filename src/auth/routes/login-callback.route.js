import Boom from "@hapi/boom";
import { logger } from "../../common/logger.js";
import { createOrUpdateUserUseCase } from "../use-cases/create-or-update-user.use-case.js";

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
    const { auth } = request;

    if (!auth.isAuthenticated) {
      throw Boom.forbidden(`Authentication failed: ${auth.error.message}`);
    }

    const authContext = {
      token: auth.credentials.token,
      profile: auth.credentials.profile,
    };

    logger.info(
      `Login callback invoked with with IDP id ${authContext.profile.oid}`,
    );

    const user = await createOrUpdateUserUseCase(authContext);

    request.yar.set("credentials", {
      token: auth.credentials.token,
      refreshToken: auth.credentials.refreshToken,
      expiresAt: Date.now() + auth.credentials.expiresIn * 1000,
      user: {
        id: user.id,
      },
    });

    logger.info(
      `Finished: Login callback invoked with with IDP id ${authContext.profile.oid}`,
    );

    return h.redirect(auth.credentials.query.next ?? "/");
  },
};

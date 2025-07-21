import Boom from "@hapi/boom";
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

    const user = await createOrUpdateUserUseCase(auth.credentials.profile);

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

    return h.redirect(auth.credentials.query.next ?? "/");
  },
};

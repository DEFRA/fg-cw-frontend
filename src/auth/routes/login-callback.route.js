import Boom from "@hapi/boom";
import { jwtDecode } from "jwt-decode";
import { createOrUpdateUserUseCase } from "../use-cases/create-or-update-user.use-case.js";

const decode = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    throw Boom.badRequest(
      `User's Entra ID token cannot be decoded: ${error.message}`,
    );
  }
};

export const loginCallbackRoute = {
  method: "GET",
  path: "/login/callback",
  options: {
    auth: {
      mode: "try",
      strategy: "msEntraId",
    },
  },
  async handler(request, h) {
    const { auth } = request;

    if (!auth.isAuthenticated) {
      throw Boom.forbidden(`Authentication failed: ${auth.error.message}`);
    }

    if (!auth.artifacts.id_token) {
      throw Boom.badRequest("User has no ID token. Cannot verify roles.");
    }

    const idToken = decode(auth.artifacts.id_token);

    const user = await createOrUpdateUserUseCase({
      email: auth.credentials.profile.email,
      idToken,
    });

    const accessToken = decode(auth.artifacts.access_token);

    request.yar.set("entra", {
      expiresAt: accessToken.exp * 1000,
      refreshToken: auth.credentials.refreshToken,
    });

    request.yar.set("credentials", {
      id: user.id,
      name: user.name,
      email: user.email,
      // scope is used by hapi to determine permissions
      scope: user.idpRoles.concat(user.appRoles),
    });

    return h.redirect(auth.credentials.query.next ?? "/");
  },
};

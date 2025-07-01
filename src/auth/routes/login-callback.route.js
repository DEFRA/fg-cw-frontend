import Boom from "@hapi/boom";
import { jwtDecode } from "jwt-decode";
import { createOrUpdateUserUseCase } from "../use-cases/create-or-update-user.use-case.js";

const decode = (idToken) => {
  try {
    return jwtDecode(idToken);
  } catch (error) {
    throw Boom.badRequest(
      `User's ID token cannot be decoded: ${error.message}`,
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

    const idToken = auth.artifacts.id_token;

    if (!idToken) {
      throw Boom.badRequest("User has no ID token. Cannot verify roles.");
    }

    await createOrUpdateUserUseCase({
      email: auth.credentials.profile.email,
      idToken: decode(idToken),
    });

    // TODO: change to use session auth
    request.cookieAuth.set({
      token: auth.credentials.token,
      authenticated: auth.isAuthenticated,
      authorised: true,
    });

    return h.redirect(auth.credentials.query.next ?? "/");
  },
};

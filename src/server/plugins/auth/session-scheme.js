import Boom from "@hapi/boom";
import { ResponseBodyError } from "openid-client";
import { loginUserUseCase } from "../../../auth/use-cases/login-user.use-case.js";
import { logger } from "../../../common/logger.js";
import { loginPath } from "./paths.js";
import { redirectToWithMemory } from "./redirect-cookie.js";
import {
  clearAuthSession,
  getAuthSession,
  profileFromAccessToken,
  setAuthSession,
  toCredentials,
} from "./session.js";

const redirectToLogin = (request, h) =>
  redirectToWithMemory(request, h, loginPath).takeover();

// Only a well-formed OAuth error response says the refresh token is spent
// (revoked, already used). A network failure or timeout throws something else,
// leaving it unknown whether the session is actually dead.
const isRefreshRejectedByEntra = (error) => error instanceof ResponseBodyError;

/**
 * The library expects `accessToken` / `refreshToken`; the session has stored
 * `token` / `refreshToken` since before this plugin existed, and must go on
 * doing so (see ./session.js). Translate at this boundary rather than rename.
 */
const refreshIfNeeded = async (request, credentials) => {
  const { token, refreshed } = await request.ensureValidToken({
    accessToken: credentials.token,
    refreshToken: credentials.refreshToken,
  });

  if (!refreshed) {
    return credentials;
  }

  // Re-running the login use case re-syncs `idpRoles` from the backend. The
  // old scheme got that for free by bouncing the user through /login every
  // time the access token expired; without it a role change would not reach
  // the UI until the session itself ended.
  const profile = profileFromAccessToken(token.accessToken);
  const user = await loginUserUseCase({ token: token.accessToken, profile });

  const refreshedCredentials = toCredentials(token, user);
  setAuthSession(request, refreshedCredentials);

  return refreshedCredentials;
};

const handleRefreshFailure = (request, h, error) => {
  if (!isRefreshRejectedByEntra(error)) {
    logger.warn(
      error,
      "Could not refresh the access token, leaving the session in place to retry",
    );
    throw Boom.serverUnavailable("Could not refresh the session");
  }

  logger.warn(error, "Refresh token rejected, sending the user back to login");
  clearAuthSession(request);

  return redirectToLogin(request, h);
};

/**
 * Protects every route, since the server defaults to this strategy. Role
 * checks are left to the handlers, which read `credentials.user.idpRoles`;
 * fg-cw-backend refuses anything the user is not entitled to regardless.
 *
 * Registered as a strategy in ./index.js.
 */
export const sessionScheme = () => ({
  async authenticate(request, h) {
    const credentials = getAuthSession(request);

    if (!credentials) {
      return redirectToLogin(request, h);
    }

    try {
      const activeCredentials = await refreshIfNeeded(request, credentials);

      return h.authenticated({ credentials: activeCredentials });
    } catch (error) {
      return handleRefreshFailure(request, h, error);
    }
  },
});

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
  toSession,
} from "./session.js";

const redirectToLogin = (request, h) =>
  redirectToWithMemory(request, h, loginPath).takeover();

// Only a well-formed OAuth error response says the refresh token is spent
// (revoked, already used). A network failure or timeout throws something else,
// leaving it unknown whether the session is actually dead.
const isRefreshRejectedByEntra = (error) => error instanceof ResponseBodyError;

/**
 * Re-running the login use case keeps `user.idpRoles` as fresh as it was before
 * refresh existed. Previously the session died at every access token expiry and
 * the bounce through /login re-synced roles from the backend; without this the
 * roles held in the session could go stale for the whole 4h yar TTL.
 */
const refreshIfNeeded = async (request, session) => {
  const { token, refreshed } = await request.ensureValidToken({
    accessToken: session.token,
    refreshToken: session.refreshToken,
  });

  if (!refreshed) {
    return session;
  }

  const profile = profileFromAccessToken(token.accessToken);
  const user = await loginUserUseCase({ token: token.accessToken, profile });

  const refreshedSession = toSession({ ...token, user });
  setAuthSession(request, refreshedSession);

  return refreshedSession;
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
 * Turns the tokens saved at the end of the OIDC handshake into hapi
 * credentials. Role checks are left alone: every one of them reads
 * `credentials.user.idpRoles`, which comes from the backend's user record
 * rather than the Entra token, and the two can legitimately differ because
 * roles are editable through the user-management screens.
 *
 * Registered as a strategy in ./index.js.
 */
export const sessionScheme = () => ({
  async authenticate(request, h) {
    const session = getAuthSession(request);

    if (!session) {
      return redirectToLogin(request, h);
    }

    try {
      const activeSession = await refreshIfNeeded(request, session);

      return h.authenticated({ credentials: activeSession });
    } catch (error) {
      return handleRefreshFailure(request, h, error);
    }
  },
});

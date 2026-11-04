import Jwt from "@hapi/jwt";

/**
 * The session key and field names predate this plugin and are deliberately
 * unchanged: around thirty route handlers read `request.auth.credentials.token`
 * and `.user`, and a rolling deploy serves old and new containers side by side.
 * Renaming anything here signs every logged in user out mid-deploy.
 */
export const sessionKey = "credentials";

export const getAuthSession = (request) =>
  request.yar.get(sessionKey) ?? undefined;

export const setAuthSession = (request, credentials) =>
  request.yar.set(sessionKey, credentials);

export const clearAuthSession = (request) => request.yar.clear(sessionKey);

/**
 * The profile comes from the access token rather than the id token, because
 * the token addressed to fg-cw-backend is the one carrying the `roles` claim
 * the UI gates on.
 */
export const profileFromAccessToken = (accessToken) => {
  const { payload } = Jwt.token.decode(accessToken).decoded;

  return {
    oid: payload.oid,
    name: payload.name,
    email: payload.email,
    roles: payload.roles ?? [],
  };
};

const msPerSecond = 1000;

/**
 * Taken from the token's own `exp` rather than the grant's `expires_in` so it
 * cannot drift, and so it is always present. Nothing here reads it any more —
 * `ensureValidToken` decides when to refresh — but containers running the
 * previous release still do, so it keeps being written until they are gone.
 */
const expiresAtFrom = (payload) => payload.exp * msPerSecond;

export const toCredentials = (token, user) => ({
  token: token.accessToken,
  refreshToken: token.refreshToken,
  expiresAt: expiresAtFrom(Jwt.token.decode(token.accessToken).decoded.payload),
  user: {
    id: user.id,
    idpRoles: user.idpRoles,
  },
});

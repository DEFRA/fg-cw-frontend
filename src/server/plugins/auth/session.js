import Jwt from "@hapi/jwt";

/**
 * The yar key and field names are deliberately the ones @hapi/bell wrote, so a
 * session created before this change is still readable afterwards. CDP rolls
 * containers gradually, and ~30 route handlers read
 * `request.auth.credentials.token` and `.user`, so changing either would sign
 * every logged-in user out mid-deploy and lose any in-flight POST.
 */
const sessionKey = "credentials";

const millisecondsPerSecond = 1000;

export const getAuthSession = (request) => request.yar.get(sessionKey) ?? null;

export const setAuthSession = (request, session) => {
  request.yar.set(sessionKey, session);
};

export const clearAuthSession = (request) => {
  request.yar.clear(sessionKey);
};

/**
 * The profile comes from the access token rather than openid-client's id token
 * claims, so `roles` is read from the exact token fg-cw-backend validates.
 */
export const profileFromAccessToken = (accessToken) => {
  const { payload } = Jwt.token.decode(accessToken).decoded;

  return {
    oid: payload.oid,
    name: payload.name,
    email: payload.email,
    roles: payload.roles || [],
  };
};

/**
 * `expiresAt` is no longer read by ./session-scheme.js, which asks
 * `ensureValidToken` instead, but containers running the previous release still
 * depend on it. Keep writing it until that release is gone everywhere.
 */
export const toSession = ({ accessToken, refreshToken, expiresIn, user }) => ({
  token: accessToken,
  refreshToken,
  expiresAt: Date.now() + expiresIn * millisecondsPerSecond,
  user: {
    id: user.id,
    idpRoles: user.idpRoles,
  },
});

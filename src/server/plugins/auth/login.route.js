import { loginPath } from "./paths.js";

/**
 * Starts the OIDC handshake. `request.login` is decorated onto the request by
 * the hapi-auth-oidc plugin: it generates the PKCE challenge, stashes the
 * verifier in a cookie and redirects to Entra ID.
 *
 * `auth: false` is explicit because the server defaults every route to the
 * `session` strategy, which would send an anonymous user straight back here.
 */
export const loginRoute = {
  method: "GET",
  path: loginPath,
  options: {
    auth: false,
  },
  handler: (request, h) => request.login(h),
};

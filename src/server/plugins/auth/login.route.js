import { loginPath } from "./paths.js";

/**
 * Starts the OIDC handshake. `request.login` builds the authorisation url,
 * generates the PKCE verifier and state, stores them in the plugin's cookie and
 * redirects the user to Entra ID.
 *
 * `auth: false` is required because the server defaults every route to the
 * `session` strategy, which would send an anonymous request straight back here.
 */
export const loginRoute = {
  method: "GET",
  path: loginPath,
  options: {
    auth: false,
  },
  handler(request, h) {
    return request.login(h);
  },
};

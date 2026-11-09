import { logAuthFailureUseCase } from "../../../auth/use-cases/log-auth-failure.use-case.js";
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
  handler: async (request, h) => {
    try {
      return await request.login(h);
    } catch (error) {
      // Discovery failures surface as a bare "fetch failed"; record why.
      logAuthFailureUseCase(error, "Entra login redirect failed");
      throw error;
    }
  },
};

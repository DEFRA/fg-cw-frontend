import {
  MockProvider,
  WebIdentityTokenProvider,
  hapiAuthOidcPlugin,
} from "@defra/hapi-auth-oidc";
import { config } from "../../../common/config.js";
import { loginCallbackPath } from "./paths.js";

const oidcConfig = config.get("oidc");
const isSecure = config.get("session.cookie.secure");

// Entra ID is only ever reached over HTTPS, so a plain HTTP discovery url means
// we are pointed at the shared Entra stub that fg-cw-backend runs.
const isLocalStub = oidcConfig.discoveryUri.startsWith("http://");

/**
 * Entra ID authenticates this app by federation rather than a shared secret:
 * AWS STS mints a short lived web identity token for the running workload, and
 * a federated credential on the app registration trusts that issuer and
 * audience, so the token is accepted as the `client_assertion`. Nothing long
 * lived is deployed alongside the app.
 *
 * The stub has no federated credential, and authenticates clients by a secret
 * it has registered for them instead.
 */
const createAuthProvider = () => {
  if (isLocalStub) {
    return new MockProvider({
      type: "client_secret",
      token: "secret1",
    });
  }

  return new WebIdentityTokenProvider({
    // STS takes Audience as a list, and the provider forwards it unchanged.
    audience: [oidcConfig.federatedCredentials.audience],
    // The provider only refreshes once expiry has passed, so buy a minute of
    // slack rather than let an assertion lapse in flight to Entra.
    earlyRefreshMs: 60_000,
  });
};

/**
 * The api scope is what makes Entra issue an access token addressed to
 * fg-cw-backend. Drop it and the token comes back with a Graph audience, the
 * backend's `aud` check against `api://<clientId>` fails, and every backend
 * call 401s. `offline_access` buys the refresh token, without which sessions
 * die at the first access token expiry.
 */
const scope = [
  "openid",
  "profile",
  "email",
  "offline_access",
  `api://${oidcConfig.clientId}/cw.backend`,
].join(" ");

/**
 * Drives the OIDC handshake with Entra ID, decorating requests with `login`,
 * `callback` and `ensureValidToken`. It registers no auth strategy of its own,
 * so route protection lives in ./session-scheme.js
 */
export const oidc = {
  plugin: hapiAuthOidcPlugin,
  options: {
    oidc: {
      clientId: oidcConfig.clientId,
      discoveryUri: oidcConfig.discoveryUri,
      useHttp: isLocalStub,
      authProvider: createAuthProvider(),
      loginCallbackUri: loginCallbackPath,
      externalBaseUrl: oidcConfig.appBaseUrl,
      scope,
      // Entra returns the auth code by POSTing a form cross-site, so the cookie
      // holding the PKCE verifier only survives the round trip when it is
      // SameSite=None, which browsers honour only on Secure cookies. Over plain
      // HTTP there is no such pairing, so take the code on a same-site redirect.
      responseMode: isSecure ? "form_post" : "query",
    },
    cookieOptions: {
      password: oidcConfig.cookie.password,
      isSecure,
      isSameSite: isSecure ? "None" : "Lax",
    },
  },
};

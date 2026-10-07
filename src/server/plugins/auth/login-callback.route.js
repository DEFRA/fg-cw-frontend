import { loginUserUseCase } from "../../../auth/use-cases/login-user.use-case.js";
import { logger } from "../../../common/logger.js";
import { continuePage } from "./continue-page.js";
import { loginCallbackPath } from "./paths.js";
import { takeRedirectTo } from "./redirect-cookie.js";
import {
  profileFromAccessToken,
  setAuthSession,
  toSession,
} from "./session.js";

/**
 * Where Entra ID returns the user. `request.callback` validates state, nonce
 * and the PKCE verifier before swapping the code for tokens, so the handler
 * body only ever runs for a request that passed those checks.
 *
 * Both methods are accepted because the response mode follows the cookie
 * security setting: `form_post` over HTTPS, a `query` redirect over plain HTTP.
 *
 * It ends in a page rather than a redirect; see ../../server/plugins/auth/continue-page.js.
 */
export const loginCallbackRoute = {
  method: ["GET", "POST"],
  path: loginCallbackPath,
  options: {
    auth: false,
  },
  async handler(request, h) {
    const token = await request.callback(h);

    const profile = profileFromAccessToken(token.accessToken);

    logger.info(`Login callback invoked with with IDP id ${profile.oid}`);

    // Create or update user and record login in a single call
    const user = await loginUserUseCase({ token: token.accessToken, profile });

    setAuthSession(request, toSession({ ...token, user }));

    logger.info(
      `Finished: Login callback invoked with with IDP id ${profile.oid}`,
    );

    // The content type is left to hapi so the handler owns the response body.
    return h
      .response(continuePage(takeRedirectTo(request, h)))
      .header("cache-control", "no-store");
  },
};

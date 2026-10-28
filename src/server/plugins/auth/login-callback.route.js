import { logAuthFailureUseCase } from "../../../auth/use-cases/log-auth-failure.use-case.js";
import { loginUserUseCase } from "../../../auth/use-cases/login-user.use-case.js";
import { logger } from "../../../common/logger.js";
import { continuePage } from "./continue-page.js";
import { loginCallbackPath } from "./paths.js";
import { takeRedirectTo } from "./redirect-cookie.js";
import {
  profileFromAccessToken,
  setAuthSession,
  toCredentials,
} from "./session.js";

/**
 * `request.callback` validates state, nonce and the PKCE verifier before
 * swapping the code for tokens, so the rest of this handler only ever runs for
 * a request that passed those checks. It throws rather than returning an
 * unauthenticated request, so the audit log hangs off a catch.
 */
const exchangeCode = async (request, h) => {
  try {
    return await request.callback(h);
  } catch (error) {
    logAuthFailureUseCase(error);
    throw error;
  }
};

/**
 * Where Entra ID returns the user. Both methods are accepted because the
 * response mode follows the cookie security setting: `form_post` over HTTPS,
 * a `query` redirect over plain HTTP.
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
    const token = await exchangeCode(request, h);

    const profile = profileFromAccessToken(token.accessToken);

    logger.info(`Login callback invoked with with IDP id ${profile.oid}`);

    // Create or update user and record login in a single call
    const user = await loginUserUseCase({ token: token.accessToken, profile });

    setAuthSession(request, toCredentials(token, user));

    logger.info(
      `Finished: Login callback invoked with with IDP id ${profile.oid}`,
    );

    return h
      .response(continuePage(takeRedirectTo(request, h)))
      .header("cache-control", "no-store");
  },
};

import { logoutPath } from "./paths.js";

/**
 * The Entra ID session is left alone, so a user who logs back in is signed
 * straight in again without re-entering credentials. This matches the
 * behaviour the bell flow had.
 */
export const logoutRoute = {
  method: "GET",
  path: logoutPath,
  options: {
    auth: false,
  },
  handler: (request, h) => {
    request.yar.reset();

    return h.redirect("/");
  },
};

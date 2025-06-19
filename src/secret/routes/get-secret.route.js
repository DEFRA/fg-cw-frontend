import { withSessionAuth } from "../../common/auth.js";

export const getSecretRoute = {
  method: "GET",
  path: "/secret",
  options: withSessionAuth(),
  handler(request, h) {
    return h.view("pages/secret", {
      authBlob: JSON.stringify(request.auth, null, 2),
      isAuthenticated: request.auth.isAuthenticated,
      isAuthorized: request.auth.isAuthorized,
    });
  },
};

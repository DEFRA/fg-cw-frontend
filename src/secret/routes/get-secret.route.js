export const getSecretRoute = {
  method: "GET",
  path: "/secret",
  options: {
    auth: {
      mode: "required",
      strategy: "session",
    },
  },
  handler(request, h) {
    return h.view("pages/secret", {
      authBlob: JSON.stringify(request.auth, null, 2),
      authenticated: request.auth.isAuthenticated
        ? "authenticated"
        : "not authenticated",
      authorised: request.auth.isAuthorized ? "authorised" : "not authorised",
    });
  },
};

export const loginRoute = {
  method: "GET",
  path: "/login",
  options: {
    auth: {
      mode: "required",
      strategy: "entra",
    },
  },
  handler(_request, h) {
    /*
     * This route is used to initiate the login process.
     * The authentication strategy 'msEntraId' will handle the redirection
     * to the Microsoft Entra ID login page.
     * Once the user is authenticated, they will be redirected back to the
     * '/login/callback' route.
     * The handler here is a placeholder to satisfy the route definition.
     * It does not perform any actions.
     * The actual login flow is managed by the Hapi authentication strategy.
     */
    return h.response().code(200);
  },
};

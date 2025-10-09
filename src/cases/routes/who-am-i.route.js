export const whoAmIRoute = {
  method: "GET",
  path: "/whoami",
  async handler(request) {
    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    return authContext;
  },
};

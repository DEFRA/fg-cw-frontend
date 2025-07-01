export const logoutRoute = {
  method: "GET",
  path: "/logout",
  options: {
    auth: false,
  },
  handler: (request, h) => {
    request.cookieAuth.clear();

    return h.redirect("/");
  },
};

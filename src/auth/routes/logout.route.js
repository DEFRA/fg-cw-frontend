export const logoutRoute = {
  method: "GET",
  path: "/logout",
  options: {
    auth: false,
  },
  handler: (request, h) => {
    request.yar.reset();

    return h.redirect("/");
  },
};

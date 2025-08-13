export const redirects = {
  plugin: {
    name: "redirects",
    register(server) {
      server.route({
        method: "GET",
        path: "/",
        handler: (_request, h) => h.redirect("/cases"),
      });
    },
  },
};

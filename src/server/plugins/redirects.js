export const redirects = {
  plugin: {
    name: "redirects",
    register(server) {
      server.route({
        method: "GET",
        path: "/",
        handler: (request, h) => {
          const { user } = request.auth.credentials;

          const path = user.idpRoles.includes("FCP.Casework.Admin")
            ? "/admin"
            : "/cases";

          return h.redirect(path);
        },
      });
    },
  },
};

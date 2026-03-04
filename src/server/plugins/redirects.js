export const redirects = {
  plugin: {
    name: "redirects",
    register(server) {
      server.route({
        method: "GET",
        path: "/",
        handler: (request, h) => {
          const { user } = request.auth.credentials;

          const hasCaseworkAccess =
            user.idpRoles.includes("FCP.Casework.ReadWrite") ||
            user.idpRoles.includes("FCP.Casework.Read");

          const path = hasCaseworkAccess ? "/cases" : "/admin";

          return h.redirect(path);
        },
      });
    },
  },
};

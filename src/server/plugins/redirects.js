import Boom from "@hapi/boom";

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

          if (hasCaseworkAccess) {
            return h.redirect("/cases");
          }

          const hasAdminAccess = user.idpRoles.includes("FCP.Casework.Admin");

          if (hasAdminAccess) {
            return h.redirect("/admin");
          }

          throw Boom.forbidden("You do not have access to this application");
        },
      });
    },
  },
};

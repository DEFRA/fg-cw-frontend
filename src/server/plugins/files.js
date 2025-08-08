import Inert from "@hapi/inert";

export const files = {
  plugin: {
    name: "files",
    async register(server) {
      await server.register(Inert);

      server.route({
        method: "GET",
        path: "/public/{param*}",
        options: {
          auth: false,
        },
        handler: {
          directory: {
            path: ".public",
            redirectToSlash: true,
            index: true,
          },
        },
      });
    },
  },
};

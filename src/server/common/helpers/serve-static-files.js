import { config } from "../../../config/config.js";

export const serveStaticFiles = {
  plugin: {
    name: "staticFiles",
    register(server) {
      server.route([
        {
          options: {
            auth: false,
            cache: {
              expiresIn: config.get("staticCacheTimeout"),
              privacy: "private",
            },
          },
          method: "GET",
          path: "/favicon.ico",
          handler(_request, h) {
            return h.response().code(204).type("image/x-icon");
          },
        },
        {
          options: {
            auth: false,
            cache: {
              expiresIn: config.get("staticCacheTimeout"),
              privacy: "private",
            },
          },
          method: "GET",
          path: `${config.get("assetPath")}/{param*}`,
          handler: {
            directory: {
              path: ".",
              redirectToSlash: true,
            },
          },
        },
      ]);
    },
  },
};

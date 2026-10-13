import { getFlashNotification } from "../../common/helpers/flash-helpers.js";

export const flashContext = {
  plugin: {
    name: "flash-context",
    register: (server) => {
      server.ext("onPreHandler", (request, h) => {
        if (request.route.settings.plugins.yar?.skip) {
          return h.continue;
        }

        request.app.notification = getFlashNotification(request);

        return h.continue;
      });
    },
  },
};

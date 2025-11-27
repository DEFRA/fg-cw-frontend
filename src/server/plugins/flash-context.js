import { getFlashNotification } from "../../common/helpers/flash-helpers.js";

export const flashContext = {
  plugin: {
    name: "flash-context",
    register: (server) => {
      server.ext("onPreHandler", (request, h) => {
        // Read flash notification data and store in request.app
        // This ensures flash notification data is only used once
        request.app.notification = getFlashNotification(request);

        return h.continue;
      });
    },
  },
};

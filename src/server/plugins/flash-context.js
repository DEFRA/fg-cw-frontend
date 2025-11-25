import { getFlashData } from "../../common/helpers/flash-helpers.js";

export const flashContext = {
  plugin: {
    name: "flash-context",
    register: (server) => {
      server.ext("onPreHandler", (request, h) => {
        // Read flash data once per request and store in request.app
        // This ensures flash data is only used once
        const { notification } = getFlashData(request);
        request.app.notification = notification;

        return h.continue;
      });
    },
  },
};

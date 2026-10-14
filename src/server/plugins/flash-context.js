import { config } from "../../common/config.js";
import { getFlashNotification } from "../../common/helpers/flash-helpers.js";

// Reading flash marks the Yar session as modified, so only read it when a
// session already exists; otherwise every cookie-less request stores a session.
const hasSession = (request) =>
  !request.route.settings.plugins.yar?.skip &&
  request.state[config.get("session.cache.name")] !== undefined;

export const flashContext = {
  plugin: {
    name: "flash-context",
    register: (server) => {
      server.ext("onPreHandler", (request, h) => {
        if (hasSession(request)) {
          request.app.notification = getFlashNotification(request);
        }

        return h.continue;
      });
    },
  },
};

import { listUsersRoute } from "./routes/user-management/list-users.route.js";
import { viewUserRoute } from "./routes/user-management/view-user.route.js";

export const admin = {
  plugin: {
    name: "admin",
    register(server) {
      server.route([listUsersRoute, viewUserRoute]);
    },
  },
};

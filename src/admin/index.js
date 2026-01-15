import { listUsersRoute } from "./routes/user-management/list-users.route.js";

export const admin = {
  plugin: {
    name: "admin",
    register(server) {
      server.route([listUsersRoute]);
    },
  },
};

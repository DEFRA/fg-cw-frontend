import { adminLandingRoute } from "./routes/admin-landing.route.js";
import { createRoleRoute } from "./routes/user-management/create-role.route.js";
import { listRolesRoute } from "./routes/user-management/list-roles.route.js";
import { listUsersRoute } from "./routes/user-management/list-users.route.js";
import { saveRoleRoute } from "./routes/user-management/save-role.route.js";
import { newRoleRoute } from "./routes/user-management/new-role.route.js";
import { saveUserRolesRoute } from "./routes/user-management/save-user-roles.route.js";
import { viewRoleRoute } from "./routes/user-management/view-role.route.js";
import { viewUserRolesRoute } from "./routes/user-management/view-user-roles.route.js";
import { viewUserRoute } from "./routes/user-management/view-user.route.js";

export const admin = {
  plugin: {
    name: "admin",

    register(server) {
      server.route([
        adminLandingRoute,
        listUsersRoute,
        viewUserRoute,
        viewUserRolesRoute,
        saveUserRolesRoute,
        listRolesRoute,
        viewRoleRoute,
        saveRoleRoute,
        newRoleRoute,
        createRoleRoute,
      ]);
    },
  },
};

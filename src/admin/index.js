import { adminLandingRoute } from "./routes/admin-landing.route.js";
import { createRoleRoute } from "./routes/user-management/create-role.route.js";
import {
  getCreateUserRoute,
  postCreateUserRoute,
} from "./routes/user-management/create-user.route.js";
import { listRolesRoute } from "./routes/user-management/list-roles.route.js";
import { listUsersRoute } from "./routes/user-management/list-users.route.js";
import { newRoleRoute } from "./routes/user-management/new-role.route.js";
import { saveUserRolesRoute } from "./routes/user-management/save-user-roles.route.js";
import { viewUserRolesRoute } from "./routes/user-management/view-user-roles.route.js";
import { viewUserRoute } from "./routes/user-management/view-user.route.js";

export const admin = {
  plugin: {
    name: "admin",

    register(server) {
      server.route([
        adminLandingRoute,
        listUsersRoute,
        getCreateUserRoute,
        postCreateUserRoute,
        viewUserRoute,
        viewUserRolesRoute,
        saveUserRolesRoute,
        listRolesRoute,
        newRoleRoute,
        createRoleRoute,
      ]);
    },
  },
};

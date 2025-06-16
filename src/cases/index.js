import { listCasesRoute } from "./routes/list-cases.route.js";
import { listTasksRoute } from "./routes/list-tasks.route.js";
import { viewCaseRoute } from "./routes/view-case.route.js";
import { viewTaskRoute } from "./routes/view-task.route.js";

export const cases = {
  plugin: {
    name: "cases",
    register(server) {
      server.route([
        listCasesRoute,
        listTasksRoute,
        viewCaseRoute,
        viewTaskRoute,
      ]);
    },
  },
};

import { completeStageRoute } from "./routes/complete-stage.route.js";
import { listCasesRoute } from "./routes/list-cases.route.js";
import { listTasksRoute } from "./routes/list-tasks.route.js";
import { updateTaskStatusRoute } from "./routes/update-task-status.route.js";
import { viewCaseRoute } from "./routes/view-case.route.js";
import { viewTaskRoute } from "./routes/view-task.route.js";

export const cases = {
  plugin: {
    name: "cases",
    async register(server, _options) {
      server.route([
        listCasesRoute,
        viewCaseRoute,
        listTasksRoute,
        viewTaskRoute,
        updateTaskStatusRoute,
        completeStageRoute,
      ]);
    },
  },
};

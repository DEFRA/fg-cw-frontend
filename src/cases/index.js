import { completeStageRoute } from "./routes/complete-stage.route.js";
import { getSecretRoute } from "./routes/get-secret.route.js";
import { listCasesRoute } from "./routes/list-cases.route.js";
import { listTasksRoute } from "./routes/list-tasks.route.js";
import { updateTaskStatusRoute } from "./routes/update-task-status.route.js";
import { viewCaseRoute } from "./routes/view-case.route.js";
import { viewTaskRoute } from "./routes/view-task.route.js";
import { timelineRoute } from "./routes/view-timeline.route.js";

export const cases = {
  plugin: {
    name: "cases",
    register(server) {
      server.route([
        listCasesRoute,
        viewCaseRoute,
        timelineRoute,
        listTasksRoute,
        viewTaskRoute,
        updateTaskStatusRoute,
        completeStageRoute,
        getSecretRoute,
      ]);
    },
  },
};

import { editComponentsRoute } from "../temp/routes/edit-components.route.js";
import { viewComponentsRoute } from "../temp/routes/get-components.route.js";
import { updateComponentsRoute } from "../temp/routes/update-components.route.js";
import { agreementsProxyRoutes } from "./routes/agreements-proxy.route.js";
import { assignUserToCaseRoute } from "./routes/assign-user/assign-user-to-case.route.js";
import { viewAssignUserToCaseRoute } from "./routes/assign-user/view-assign-user-to-case.route.js";
import { getSecretWorkflowRoute } from "./routes/get-secret-workflow.route.js";
import { getSecretRoute } from "./routes/get-secret.route.js";
import { listCasesRoute } from "./routes/list-cases.route.js";
import { listTasksRoute } from "./routes/list-tasks.route.js";
import { createNoteRoute } from "./routes/notes/create-note.route.js";
import { newNoteRoute } from "./routes/notes/new-note.route.js";
import { viewNotesRoute } from "./routes/notes/view-notes.route.js";
import { viewCaseTabRoute } from "./routes/tabs/view-case-tab.route.js";
import { updateStageOutcomeRoute } from "./routes/update-stage-outcome.route.js";
import { updateTaskStatusRoute } from "./routes/update-task-status.route.js";
import { viewTaskRoute } from "./routes/view-task.route.js";
import { timelineRoute } from "./routes/view-timeline.route.js";

export const cases = {
  plugin: {
    name: "cases",
    register(server) {
      const routes = [
        ...agreementsProxyRoutes,
        listCasesRoute,
        viewNotesRoute,
        newNoteRoute,
        createNoteRoute,
        timelineRoute,
        listTasksRoute,
        viewTaskRoute,
        updateTaskStatusRoute,
        updateStageOutcomeRoute,
        getSecretRoute,
        getSecretWorkflowRoute,
        viewAssignUserToCaseRoute,
        assignUserToCaseRoute,
        viewCaseTabRoute,
        viewComponentsRoute,
        editComponentsRoute,
        updateComponentsRoute,
      ];

      server.route(routes);
    },
  },
};

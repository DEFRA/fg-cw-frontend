import { assignUserToCaseRoute } from "./routes/assign-user/assign-user-to-case.route.js";
import { viewAssignUserToCaseRoute } from "./routes/assign-user/view-assign-user-to-case.route.js";
import { getSecretRoute } from "./routes/get-secret.route.js";
import { listCasesRoute } from "./routes/list-cases.route.js";
import { listTasksRoute } from "./routes/list-tasks.route.js";
import { createNoteRoute } from "./routes/notes/create-note.route.js";
import { newNoteRoute } from "./routes/notes/new-note.route.js";
import { viewNotesRoute } from "./routes/notes/view-notes.route.js";
import { submitStageActionRoute } from "./routes/submit-stage-action.route.js";
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
        viewNotesRoute,
        newNoteRoute,
        createNoteRoute,
        timelineRoute,
        listTasksRoute,
        viewTaskRoute,
        updateTaskStatusRoute,
        submitStageActionRoute,
        getSecretRoute,
        viewAssignUserToCaseRoute,
        assignUserToCaseRoute,
      ]);
    },
  },
};

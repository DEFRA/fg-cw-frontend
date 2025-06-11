import { findById } from "../repositories/case.repository.js";
import { findByCode } from "../repositories/workflow.repository.js";

// TODO: move to the backend
const addTitles = (kase, workflow) => ({
  ...kase,
  stages: kase.stages.map((stage) => {
    const workflowStage = workflow.stages.find((ws) => ws.id === stage.id);

    return {
      ...stage,
      title: workflowStage.title,
      actions: workflowStage.actions,
      taskGroups: stage.taskGroups.map((tg) => {
        const wtg = workflowStage.taskGroups.find((wtg) => wtg.id === tg.id);

        return {
          ...tg,
          title: wtg.title,
          tasks: tg.tasks.map((task) => {
            const workflowTask = wtg.tasks.find((wt) => wt.id === task.id);

            return {
              ...task,
              title: workflowTask.title,
              type: workflowTask.type,
            };
          }),
        };
      }),
    };
  }),
});

export const findCaseByIdUseCase = async (caseId) => {
  const kase = await findById(caseId);
  const workflow = await findByCode(kase.workflowCode);

  return addTitles(kase, workflow);
};

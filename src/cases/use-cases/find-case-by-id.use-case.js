import { findById } from "../repositories/case.repository.js";
import { findByCode } from "../repositories/workflow.repository.js";

const defaultTabs = ["tasks", "caseDetails", "notes", "timeline"];

// TODO: move to the backend: https://eaflood.atlassian.net/jira/software/projects/FUT/boards/1668?selectedIssue=FUT-563
const addTitles = (kase, workflow, overrideTabs, customTabs) => ({
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
  overrideTabs,
  customTabs,
});

const createTabObject = (tabId, tabConfig) => ({
  id: tabId,
  ...tabConfig,
});

export const findCaseByIdUseCase = async (caseId) => {
  const kase = await findById(caseId);
  const workflow = await findByCode(kase.workflowCode);
  const workflowTabs = workflow.pages.cases.details.tabs;

  const overrideTabs = defaultTabs
    .filter((tabId) => tabId in workflowTabs)
    .map((tabId) => createTabObject(tabId, workflowTabs[tabId]));

  const customTabs = Object.entries(workflowTabs)
    .filter(([tabId]) => !defaultTabs.includes(tabId))
    .map(([tabId, config]) => createTabObject(tabId, config));

  const caseWithTitles = addTitles(kase, workflow, overrideTabs, customTabs);

  return caseWithTitles;
};

import { findById } from "../repositories/case.repository.js";
import { findByCode } from "../repositories/workflow.repository.js";

const defaultTabs = ["tasks", "caseDetails", "notes", "timeline"];

// TODO: move to the backend: https://eaflood.atlassian.net/jira/software/projects/FUT/boards/1668?selectedIssue=FUT-563

const processTask = (task, wfTaskGroup) => {
  const workflowTask = wfTaskGroup.tasks.find((wt) => wt.id === task.id);

  return {
    ...task,
    title: workflowTask.title,
    type: workflowTask.type,
  };
};

const processTaskGroup = (taskGroup, workflowStage) => {
  const wfTaskGroup = workflowStage.taskGroups.find(
    (wtg) => wtg.id === taskGroup.id,
  );

  return {
    ...taskGroup,
    title: wfTaskGroup.title,
    tasks: taskGroup.tasks.map((task) => processTask(task, wfTaskGroup)),
  };
};

const processStage = (stage, workflow) => {
  const workflowStage = workflow.stages.find((ws) => ws.id === stage.id);

  return {
    ...stage,
    title: workflowStage.title,
    actions: workflowStage.actions,
    taskGroups: stage.taskGroups.map((taskGroup) =>
      processTaskGroup(taskGroup, workflowStage),
    ),
  };
};

const addTitles = (kase, workflow, overrideTabs, customTabs, banner) => ({
  ...kase,
  stages: kase.stages.map((stage) => processStage(stage, workflow)),
  banner,
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
  const banner = workflow.pages.cases.details.banner;

  const overrideTabs = defaultTabs
    .filter((tabId) => tabId in workflowTabs)
    .map((tabId) => createTabObject(tabId, workflowTabs[tabId]));

  const customTabs = Object.entries(workflowTabs)
    .filter(([tabId]) => !defaultTabs.includes(tabId))
    .map(([tabId, config]) => createTabObject(tabId, config));

  const caseWithTitles = addTitles(
    kase,
    workflow,
    overrideTabs,
    customTabs,
    banner,
  );

  return caseWithTitles;
};

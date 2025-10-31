import { findById } from "../repositories/case.repository.js";
import { findByCode } from "../repositories/workflow.repository.js";

const defaultTabs = ["tasks", "caseDetails", "notes", "timeline"];

const createTabObject = (tabId, tabConfig) => ({
  id: tabId,
  ...tabConfig,
});

export const findCaseByIdUseCase = async (authContext, caseId) => {
  const kase = await findById(authContext, caseId);
  const workflow = await findByCode(authContext, kase.workflowCode);
  const workflowTabs = workflow.pages.cases.details.tabs;
  const banner = kase.banner;

  const overrideTabs = defaultTabs
    .filter((tabId) => tabId in workflowTabs)
    .map((tabId) => createTabObject(tabId, workflowTabs[tabId]));

  const customTabs = Object.entries(workflowTabs)
    .filter(([tabId]) => !defaultTabs.includes(tabId))
    .map(([tabId, config]) => createTabObject(tabId, config));

  return {
    ...kase,
    banner,
    overrideTabs,
    customTabs,
  };
};

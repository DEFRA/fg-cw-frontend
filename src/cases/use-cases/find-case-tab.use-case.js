import { findTabById } from "../repositories/case.repository.js";
import { findCaseByIdUseCase } from "./find-case-by-id.use-case.js";

const mergeBannerActions = (tabData, externalActions) => {
  if (!externalActions || externalActions.length === 0) {
    return tabData;
  }

  const banner = { ...(tabData.banner || {}), externalActions };
  return { ...tabData, banner };
};

export const findCaseTabUseCase = async (authContext, caseId, tabId) => {
  const tabData = await findTabById(authContext, caseId, tabId);
  // Reuse existing logic so workflow is fetched in one place
  const caseItem = await findCaseByIdUseCase(authContext, caseId);

  return mergeBannerActions(tabData, caseItem?.banner?.externalActions);
};

import { setFlashData } from "../../common/helpers/flash-helpers.js";
import { updateStageOutcomeUseCase } from "../use-cases/update-stage-outcome-use.case.js";

export const updateStageOutcomeRoute = {
  method: "POST",
  path: "/cases/{caseId}/stage/outcome",
  handler: async (request, h) => {
    const {
      params: { caseId },
      payload,
    } = request;

    const result = await updateStageOutcomeUseCase(caseId, payload);

    if (!result.success) {
      setFlashData(request, {
        errors: result.errors,
        formData: payload,
      });
    }

    return h.redirect(`/cases/${caseId}`);
  },
};

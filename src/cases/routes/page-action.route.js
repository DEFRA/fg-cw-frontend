import { setFlashNotification } from "../../common/helpers/flash-helpers.js";
import { triggerPageActionUseCase } from "../use-cases/trigger-page-action.use-case.js";

export const pageActionRoute = {
  method: "POST",
  path: "/cases/{caseId}/page-action",
  async handler(request, h) {
    const { caseId } = request.params;
    const { actionCode, actionName } = request.payload;

    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    try {
      await triggerPageActionUseCase(authContext, { caseId, actionCode });

      const displayName = actionName || "Action";
      setFlashNotification(request, {
        variant: "success",
        title: "Action completed",
        text: `${displayName} completed successfully`,
      });
    } catch (_error) {
      setFlashNotification(request, {
        variant: "error",
        title: "There is a problem right now",
        text: "Try again later.",
        showTitleAsHeading: true,
      });
    }

    // Redirect back to the referring page or default to case detail
    const referer = request.headers.referer || `/cases/${caseId}`;
    return h.redirect(referer);
  },
};

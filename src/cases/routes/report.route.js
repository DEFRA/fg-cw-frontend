import { reportCasesUseCase } from "../use-cases/report-cases.use-case.js";
import { createReportViewModel } from "../view-models/report.view-model.js";

export const reportRoute = {
  method: "GET",
  path: "/reports",
  async handler(request, h) {
    const authContext = {
      token: request.auth.credentials.token,
      user: request.auth.credentials.user,
    };

    const page = await reportCasesUseCase(authContext, request.query);

    const viewModel = createReportViewModel({ page, request });

    return h.view("pages/report", viewModel);
  },
};

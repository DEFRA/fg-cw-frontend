import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { nunjucks } from "../../common/nunjucks/nunjucks.js";
import { completeStageUseCase } from "../use-cases/complete-stage.use-case.js";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { submitStageActionRoute } from "./submit-stage-action.route.js";

vi.mock("../use-cases/find-case-by-id.use-case.js");
vi.mock("../use-cases/complete-stage.use-case.js");

describe("submitStageOutcomeRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(submitStageActionRoute);
    await server.register([nunjucks]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("completes a stage", async () => {
    findCaseByIdUseCase.mockResolvedValue({
      _id: "68495db5afe2d27b09b2ee47",
      caseRef: "banana-123",
      workflowCode: "frps-private-beta",
      status: "NEW",
      dateReceived: "2025-06-11T10:43:01.603Z",
      currentStage: "application-receipt",
      payload: {
        clientRef: "banana-123",
        code: "frps-private-beta",
        createdAt: "2025-06-11T10:43:01.417Z",
        submittedAt: "2023-10-01T12:00:00.000Z",
        identifiers: {
          sbi: "SBI001",
          frn: "FIRM0001",
          crn: "CUST0001",
          defraId: "DEFRA0001",
        },
        answers: {
          agreementName: "Test application name 1",
          scheme: "SFI",
          year: 2025,
          hasCheckedLandIsUpToDate: true,
          actionApplications: [
            {
              parcelId: "9238",
              sheetId: "SX0679",
              code: "CSAM1",
              appliedFor: {
                unit: "ha",
                quantity: 20.23,
              },
            },
          ],
        },
      },
      stages: [
        {
          id: "application-receipt",
          title: "Application Receipt",
          taskGroups: [
            {
              id: "application-receipt-tasks",
              title: "Application Receipt Tasks",
              tasks: [
                {
                  id: "simple-review",
                  title: "Simple Review",
                  status: "pending",
                },
              ],
            },
          ],
        },
        {
          id: "contract",
          title: "Contract",
          taskGroups: [],
        },
      ],
    });

    completeStageUseCase.mockResolvedValue({});

    const { statusCode, result } = await server.inject({
      method: "POST",
      url: "/cases/1234",
    });

    expect(statusCode).toEqual(200);
    expect(findCaseByIdUseCase).toHaveBeenCalledWith("1234");

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });
});

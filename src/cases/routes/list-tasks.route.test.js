import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createMockLinks } from "../../../test/data/case-test-data.js";
import { nunjucks } from "../../common/nunjucks/nunjucks.js";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { listTasksRoute } from "./list-tasks.route.js";

vi.mock("../use-cases/find-case-by-id.use-case.js");
vi.mock("../../common/helpers/flash-helpers.js", () => ({
  getFlashData: vi.fn(() => ({ errors: {}, formData: {} })),
}));

describe("listTasksRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(listTasksRoute);
    await server.register([nunjucks]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("returns a case with tasks", async () => {
    findCaseByIdUseCase.mockResolvedValue({
      _id: "68495db5afe2d27b09b2ee47",
      caseRef: "banana-123",
      workflowCode: "frps-private-beta",
      dateReceived: "2025-06-11T10:43:01.603Z",
      currentPhase: "phase-1",
      currentStage: "application-receipt",
      currentStatus: "NEW",
      links: createMockLinks("68495db5afe2d27b09b2ee47"),
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
      stage: {
        code: "application-receipt",
        name: "Application Receipt",
        taskGroups: [
          {
            code: "application-receipt-tasks",
            name: "Application Receipt Tasks",
            tasks: [
              {
                code: "simple-review",
                name: "Simple Review",
                status: "pending",
              },
            ],
          },
        ],
      },
    });

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/cases/xxxxxxxx",
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    const authContext = {
      token: "mock-token",
      user: {},
    };

    expect(statusCode).toEqual(200);
    expect(findCaseByIdUseCase).toHaveBeenCalledWith(authContext, "xxxxxxxx");

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });
});

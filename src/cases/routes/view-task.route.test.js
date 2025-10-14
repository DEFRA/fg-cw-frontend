import hapi from "@hapi/hapi";
import Yar from "@hapi/yar";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createMockLinks } from "../../../test/data/case-test-data.js";
import { nunjucks } from "../../common/nunjucks/nunjucks.js";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { viewTaskRoute } from "./view-task.route.js";

vi.mock("../use-cases/find-case-by-id.use-case.js");

describe("viewTaskRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    await server.register({
      plugin: Yar,
      options: {
        name: "session",
        cookieOptions: {
          password: "abcdefghijklmnopqrstuvwxyz012345",
          isSecure: false,
          isSameSite: "Strict",
        },
      },
    });

    server.route(viewTaskRoute);
    await server.register([nunjucks]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("returns a task", async () => {
    findCaseByIdUseCase.mockResolvedValue({
      _id: "68495db5afe2d27b09b2ee47",
      caseRef: "banana-123",
      workflowCode: "frps-private-beta",
      status: "NEW",
      dateReceived: "2025-06-11T10:43:01.603Z",
      currentStage: "application-receipt",
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
      stages: [
        {
          code: "application-receipt",
          name: "Application Receipt",
          taskGroups: [
            {
              code: "application-receipt-tasks",
              title: "Application Receipt Tasks",
              tasks: [
                {
                  id: "simple-review",
                  title: "Simple Review",
                  status: "pending",
                  type: "OPTIONAL",
                },
              ],
            },
          ],
        },
        {
          code: "contract",
          name: "Contract",
          taskGroups: [],
        },
      ],
      comments: [],
    });

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/cases/68495db5afe2d27b09b2ee47/tasks/application-receipt-tasks/simple-review",
      auth: {
        credentials: { token: "mock-token" },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });
});

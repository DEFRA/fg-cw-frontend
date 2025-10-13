import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createMockLinks } from "../../../test/data/case-test-data.js";
import { nunjucks } from "../../common/nunjucks/nunjucks.js";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { timelineRoute } from "./view-timeline.route.js";

vi.mock("../use-cases/find-case-by-id.use-case.js");

describe("timelineRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(timelineRoute);
    await server.register([nunjucks]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("displays a timeline", async () => {
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
          code: "contract",
          title: "Contract",
          taskGroups: [],
        },
      ],
      timeline: [
        {
          eventType: "CASE_CREATED",
          createdAt: "2025-06-16T09:01:14.072Z",
          description: "Case received",
          createdBy: { name: "Julian Kimmings" },
          data: {
            caseRef: "APPLICATION-REF-3",
          },
        },
        {
          eventType: "CASE_ASSIGNED",
          description: "Case assigned",
          createdAt: "2025-06-16T09:01:14.072Z",
          createdBy: { name: "Julian Kimmings" },
          data: {
            assignedTo: { name: "martin smith" },
          },
        },
        {
          eventType: "TASK_COMPLETED",
          description: "Task completed",
          createdAt: "2025-06-16T09:01:14.072Z",
          createdBy: { name: "Nicholai Hel" },
          data: {
            taskGroupId: "tg-01",
            taskId: "task-01",
          },
        },
      ],
    });

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/cases/68495db5afe2d27b09b2ee47/timeline",
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

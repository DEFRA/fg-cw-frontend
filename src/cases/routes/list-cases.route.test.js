import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { nunjucks } from "../../common/nunjucks/nunjucks.js";
import { findAllCasesUseCase } from "../use-cases/find-all-cases.use-case.js";
import { listCasesRoute } from "./list-cases.route.js";

vi.mock("../use-cases/find-all-cases.use-case.js");

describe("listCasesRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(listCasesRoute);
    await server.register([nunjucks]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("returns a list of cases", async () => {
    findAllCasesUseCase.mockResolvedValue(mockCases);

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/cases",
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });

  it("extracts assignedCaseId from query parameters and renders notification banner", async () => {
    findAllCasesUseCase.mockResolvedValue(mockCases);

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: `/cases?assignedCaseId=${mockCases[0]._id}`,
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $(".govuk-notification-banner--success").html();

    expect(view).toMatchSnapshot();
  });
});

const mockCases = [
  {
    _id: "68495db5afe2d27b09b2ee47",
    caseRef: "banana-123",
    workflowCode: "frps-private-beta",
    status: "NEW",
    dateReceived: "2025-06-11T10:43:01.603Z",
    currentStage: "contract",
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
        taskGroups: [
          {
            id: "application-receipt-tasks",
            tasks: [
              {
                id: "simple-review",
                isComplete: false,
              },
            ],
          },
        ],
      },
      {
        id: "contract",
        taskGroups: [],
      },
    ],
    assignedUser: {
      id: "user-id-1",
      name: "John Smith",
    },
  },
  {
    _id: "68495db5afe2d27b09b2ee99",
    caseRef: "case-ref-2",
    workflowCode: "frps-private-beta",
    status: "OLD",
    dateReceived: "2025-06-11T10:43:01.603Z",
    currentStage: "contract",
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
        taskGroups: [
          {
            id: "application-receipt-tasks",
            tasks: [
              {
                id: "simple-review",
                isComplete: false,
              },
            ],
          },
        ],
      },
      {
        id: "contract",
        taskGroups: [],
      },
    ],
  },
];

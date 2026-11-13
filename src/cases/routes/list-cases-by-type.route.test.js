import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { nunjucks } from "../../common/nunjucks/nunjucks.js";
import { findAllCasesUseCase } from "../use-cases/find-all-cases.use-case.js";
import { listCasesByTypeRoute } from "./list-cases-by-type.route.js";

vi.mock("../use-cases/find-all-cases.use-case.js");
vi.mock("../../common/view-models/header.view-model.js");

const createMockPage = (cases, pagination = {}) => ({
  data: {
    cases,
    pagination: {
      totalCount: cases.length,
      ...pagination,
    },
  },
  header: { navItems: [] },
});

describe("listCasesByTypeRoute", () => {
  let server;
  let flashAssignedCaseId;

  beforeAll(async () => {
    server = hapi.server();
    server.ext("onPreHandler", (request, h) => {
      request.yar = {
        flash: (key) => {
          if (key === "assignedCaseId") {
            return flashAssignedCaseId ? [flashAssignedCaseId] : [];
          }

          return [];
        },
      };
      return h.continue;
    });
    server.route(listCasesByTypeRoute);
    await server.register([nunjucks]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("returns a list of cases filtered by type", async () => {
    flashAssignedCaseId = undefined;
    findAllCasesUseCase.mockResolvedValue(createMockPage(mockCases));

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/types/woodland/cases",
      auth: {
        credentials: { token: "mock-token" },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
    expect(findAllCasesUseCase).toHaveBeenCalledWith(
      { token: "mock-token", user: undefined },
      { caseType: "woodland" },
    );
  });

  it("renders page heading with case type", async () => {
    flashAssignedCaseId = undefined;
    findAllCasesUseCase.mockResolvedValue(createMockPage(mockCases));

    const { result } = await server.inject({
      method: "GET",
      url: "/types/woodland/cases",
      auth: {
        credentials: { token: "mock-token" },
        strategy: "session",
      },
    });

    const $ = load(result);
    expect($("title").text()).toContain("Cases \u2013 woodland");
  });

  it("renders empty state message when no cases exist for the type", async () => {
    flashAssignedCaseId = undefined;
    findAllCasesUseCase.mockResolvedValue(createMockPage([]));

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/types/woodland/cases",
      auth: {
        credentials: { token: "mock-token" },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    expect($("p").text()).toContain("There are no cases for this case type");
  });

  it("redirects when search query is empty", async () => {
    flashAssignedCaseId = undefined;

    const { statusCode, headers } = await server.inject({
      method: "GET",
      url: "/types/woodland/cases?search=",
      auth: {
        credentials: { token: "mock-token" },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(302);
    expect(headers.location).toBe("/types/woodland/cases");
    expect(findAllCasesUseCase).not.toHaveBeenCalled();
  });

  it("passes search query parameter to use case", async () => {
    flashAssignedCaseId = undefined;
    findAllCasesUseCase.mockResolvedValue(createMockPage(mockCases));

    const { statusCode } = await server.inject({
      method: "GET",
      url: "/types/woodland/cases?search=12345",
      auth: {
        credentials: { token: "mock-token" },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);
    expect(findAllCasesUseCase).toHaveBeenCalledWith(
      { token: "mock-token", user: undefined },
      { search: "12345", caseType: "woodland" },
    );
  });

  it("sets search form action to the case-type-scoped path", async () => {
    flashAssignedCaseId = undefined;
    findAllCasesUseCase.mockResolvedValue(createMockPage(mockCases));

    const { result } = await server.inject({
      method: "GET",
      url: "/types/woodland/cases",
      auth: {
        credentials: { token: "mock-token" },
        strategy: "session",
      },
    });

    const $ = load(result);
    expect($("form").attr("action")).toBe("/types/woodland/cases");
  });
});

const mockCases = [
  {
    _id: "68495db5afe2d27b09b2ee47",
    caseRef: "banana-123",
    workflowCode: "woodland",
    schemeName: "Woodland Management Plan",
    createdAt: "2025-06-11T10:43:01.603Z",
    currentStatus: "NEW",
    currentStatusTheme: "INFO",
    payload: {
      clientRef: "banana-123",
      code: "woodland",
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
        actionApplications: [],
      },
    },
    assignedUser: {
      id: "user-id-1",
      name: "Example Caseworker",
    },
  },
];

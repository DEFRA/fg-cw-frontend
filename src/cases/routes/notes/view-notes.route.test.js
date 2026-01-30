import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createMockCaseData } from "../../../../test/data/case-test-data.js";
import { nunjucks } from "../../../common/nunjucks/nunjucks.js";
import { findCaseByIdUseCase } from "../../use-cases/find-case-by-id.use-case.js";
import { viewNotesRoute } from "./view-notes.route.js";

vi.mock("../../use-cases/find-case-by-id.use-case.js");
vi.mock("../../../common/view-models/header.view-model.js");

const createMockPage = (caseData) => ({
  data: caseData,
  header: { navItems: [] },
});

describe("viewNotesRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(viewNotesRoute);
    await server.register([nunjucks]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("calls use case with correct caseId", async () => {
    const mockCaseData = createMockCaseData();

    findCaseByIdUseCase.mockResolvedValue(createMockPage(mockCaseData));

    await server.inject({
      method: "GET",
      url: "/cases/68495db5afe2d27b09b2ee47/notes",
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

    expect(findCaseByIdUseCase).toHaveBeenCalledWith(
      authContext,
      "68495db5afe2d27b09b2ee47",
      "notes",
    );
  });

  it("renders page and returns 200 ok", async () => {
    const mockCaseData = createMockCaseData();

    findCaseByIdUseCase.mockResolvedValue(createMockPage(mockCaseData));

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/cases/68495db5afe2d27b09b2ee47/notes",
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });

  it("handles case with no comments", async () => {
    const mockCaseData = createMockCaseData({
      comments: [],
    });

    findCaseByIdUseCase.mockResolvedValue(createMockPage(mockCaseData));

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/cases/68495db5afe2d27b09b2ee47/notes",
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });

  it("handles case with null comments", async () => {
    const mockCaseData = createMockCaseData({
      comments: null,
    });

    findCaseByIdUseCase.mockResolvedValue(createMockPage(mockCaseData));

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/cases/68495db5afe2d27b09b2ee47/notes",
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });

  it("displays empty state message when there are no notes", async () => {
    const mockCaseData = createMockCaseData({
      comments: [],
    });

    findCaseByIdUseCase.mockResolvedValue(createMockPage(mockCaseData));

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/cases/68495db5afe2d27b09b2ee47/notes",
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    const emptyStateMessage = $("p.govuk-body").text();

    expect(emptyStateMessage).toBe("There are no notes yet.");
    expect($("table").length).toBe(0);
  });
});

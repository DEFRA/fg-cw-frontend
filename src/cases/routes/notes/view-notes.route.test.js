import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createMockCaseData } from "../../../../test/data/case-test-data.js";
import { nunjucks } from "../../../common/nunjucks/nunjucks.js";
import { findCaseByIdUseCase } from "../../use-cases/find-case-by-id.use-case.js";
import { viewNotesRoute } from "./view-notes.route.js";

vi.mock("../../use-cases/find-case-by-id.use-case.js");

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

    findCaseByIdUseCase.mockResolvedValue(mockCaseData);

    await server.inject({
      method: "GET",
      url: "/cases/68495db5afe2d27b09b2ee47/notes",
    });

    expect(findCaseByIdUseCase).toHaveBeenCalledWith(
      "68495db5afe2d27b09b2ee47",
    );
  });

  it("renders page and returns 200 ok", async () => {
    const mockCaseData = createMockCaseData();

    findCaseByIdUseCase.mockResolvedValue(mockCaseData);

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/cases/68495db5afe2d27b09b2ee47/notes",
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

    findCaseByIdUseCase.mockResolvedValue(mockCaseData);

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/cases/68495db5afe2d27b09b2ee47/notes",
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

    findCaseByIdUseCase.mockResolvedValue(mockCaseData);

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/cases/68495db5afe2d27b09b2ee47/notes",
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });
});

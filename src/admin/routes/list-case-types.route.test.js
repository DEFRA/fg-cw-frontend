import Boom from "@hapi/boom";
import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { getCaseTypesUseCase } from "../use-cases/get-case-types.use-case.js";
import { nunjucks } from "../../common/nunjucks/nunjucks.js";
import { listCaseTypesRoute } from "./list-case-types.route.js";

vi.mock("../use-cases/get-case-types.use-case.js");
vi.mock("../../common/view-models/header.view-model.js");

const createMockPage = (caseTypes) => ({
  data: caseTypes,
  header: { navItems: [] },
});

describe("listCaseTypesRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(listCaseTypesRoute);
    await server.register([nunjucks]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("is configured correctly", () => {
    expect(listCaseTypesRoute.method).toEqual("GET");
    expect(listCaseTypesRoute.path).toEqual("/case-types");
  });

  it("renders case types page", async () => {
    getCaseTypesUseCase.mockResolvedValue(
      createMockPage([{ code: "woodland" }, { code: "frps-private-beta" }]),
    );

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/case-types",
      auth: {
        credentials: { token: "mock-token", user: { id: "user-123" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });

  it("renders empty state when there are no case types", async () => {
    getCaseTypesUseCase.mockResolvedValue(createMockPage([]));

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/case-types",
      auth: {
        credentials: { token: "mock-token", user: { id: "user-123" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });

  it("passes auth context to getCaseTypesUseCase", async () => {
    getCaseTypesUseCase.mockResolvedValue(createMockPage([]));

    await server.inject({
      method: "GET",
      url: "/case-types",
      auth: {
        credentials: { token: "mock-token", user: { id: "user-123" } },
        strategy: "session",
      },
    });

    expect(getCaseTypesUseCase).toHaveBeenCalledWith({
      token: "mock-token",
      user: { id: "user-123" },
    });
  });

  it("returns 403 when backend forbids listing case types", async () => {
    getCaseTypesUseCase.mockRejectedValue(Boom.forbidden("Forbidden"));

    const { statusCode } = await server.inject({
      method: "GET",
      url: "/case-types",
      auth: {
        credentials: { token: "mock-token", user: { id: "user-123" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(403);
  });
});

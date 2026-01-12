import Boom from "@hapi/boom";
import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { findAllUsersUseCase } from "../../../auth/use-cases/find-all-users.use-case.js";
import { nunjucks } from "../../../common/nunjucks/nunjucks.js";
import { listUsersRoute } from "./list-users.route.js";

vi.mock("../../../auth/use-cases/find-all-users.use-case.js");

describe("listUsersRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(listUsersRoute);
    await server.register([nunjucks]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("renders users page", async () => {
    findAllUsersUseCase.mockResolvedValue([
      {
        id: "user-2",
        name: "Zara Zee",
        email: "zara@example.com",
        updatedAt: null,
      },
      {
        id: "user-1",
        name: "Alice Able",
        email: "alice@example.com",
        updatedAt: null,
      },
    ]);

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/admin/user-management",
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

  it("renders empty state when there are no users", async () => {
    findAllUsersUseCase.mockResolvedValue([]);

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/admin/user-management",
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

  it("renders blank last login when updatedAt missing", async () => {
    findAllUsersUseCase.mockResolvedValue([
      {
        id: "user-1",
        name: "Alice Able",
        email: "alice@example.com",
      },
    ]);

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/admin/user-management",
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

  it("returns 403 when backend forbids listing users", async () => {
    findAllUsersUseCase.mockRejectedValue(Boom.forbidden("Forbidden"));

    const { statusCode } = await server.inject({
      method: "GET",
      url: "/admin/user-management",
      auth: {
        credentials: { token: "mock-token" },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(403);
  });
});

import Boom from "@hapi/boom";
import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { getRolesUseCase } from "../../../auth/use-cases/get-roles.use-case.js";
import { nunjucks } from "../../../common/nunjucks/nunjucks.js";
import { listRolesRoute } from "./list-roles.route.js";

vi.mock("../../../auth/use-cases/get-roles.use-case.js");

describe("listRolesRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(listRolesRoute);
    await server.register([nunjucks]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("is configured correctly", () => {
    expect(listRolesRoute.method).toEqual("GET");
    expect(listRolesRoute.path).toEqual("/admin/user-management/roles");
  });

  it("renders roles page with breadcrumbs", async () => {
    getRolesUseCase.mockResolvedValue([
      {
        code: "PMF_READ",
        description: "Pigs Might Fly read only",
        assignable: true,
      },
      {
        code: "PMF_WRITE",
        description: "Pigs Might Fly read write",
        assignable: true,
      },
    ]);

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/admin/user-management/roles",
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

  it("renders empty state when there are no roles", async () => {
    getRolesUseCase.mockResolvedValue([]);

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/admin/user-management/roles",
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

  it("passes auth context to getRolesUseCase", async () => {
    getRolesUseCase.mockResolvedValue([]);

    await server.inject({
      method: "GET",
      url: "/admin/user-management/roles",
      auth: {
        credentials: { token: "mock-token", user: { id: "user-123" } },
        strategy: "session",
      },
    });

    expect(getRolesUseCase).toHaveBeenCalledWith({
      token: "mock-token",
      user: { id: "user-123" },
    });
  });

  it("returns 403 when backend forbids listing roles", async () => {
    getRolesUseCase.mockRejectedValue(Boom.forbidden("Forbidden"));

    const { statusCode } = await server.inject({
      method: "GET",
      url: "/admin/user-management/roles",
      auth: {
        credentials: { token: "mock-token", user: { id: "user-123" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(403);
  });
});

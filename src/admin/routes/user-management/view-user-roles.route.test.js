import Boom from "@hapi/boom";
import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { adminFindUserByIdUseCase } from "../../../auth/use-cases/admin-find-user-by-id.use-case.js";
import { nunjucks } from "../../../common/nunjucks/nunjucks.js";
import { findRolesUseCase } from "../../use-cases/find-roles.use-case.js";
import { viewUserRolesRoute } from "./view-user-roles.route.js";

vi.mock("../../../auth/use-cases/admin-find-user-by-id.use-case.js");
vi.mock("../../use-cases/find-roles.use-case.js");

describe("viewUserRolesRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(viewUserRolesRoute);
    await server.register([nunjucks]);
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("renders user roles page and checks currently allocated roles", async () => {
    adminFindUserByIdUseCase.mockResolvedValue({
      id: "user-123",
      name: "Martin Smith",
      appRoles: {
        PMF_READ: { startDate: "2025-07-01", endDate: "2025-08-02" },
        PMF_READ_WRITE: {},
      },
    });

    findRolesUseCase.mockResolvedValue([
      {
        id: "r1",
        code: "PMF_READ",
        description: "Pigs Might Fly read only",
        assignable: true,
      },
      {
        id: "r2",
        code: "PMF_READ_WRITE",
        description: "Pigs Might Fly read write",
        assignable: false,
      },
    ]);

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/admin/user-management/user-123/roles",
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    expect($("input[value='PMF_READ']").attr("checked")).toBeDefined();
    expect($("input[value='PMF_READ_WRITE']").attr("checked")).toBeDefined();
  });

  it("returns 403 when backend forbids viewing roles", async () => {
    adminFindUserByIdUseCase.mockRejectedValue(Boom.forbidden("Forbidden"));

    const { statusCode } = await server.inject({
      method: "GET",
      url: "/admin/user-management/user-123/roles",
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(403);
  });
});

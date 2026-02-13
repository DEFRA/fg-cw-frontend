import Boom from "@hapi/boom";
import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { nunjucks } from "../../../common/nunjucks/nunjucks.js";
import { findUserRolesDataUseCase } from "../../use-cases/find-user-roles-data.use-case.js";
import { viewUserRolesRoute } from "./view-user-roles.route.js";

vi.mock("../../use-cases/find-user-roles-data.use-case.js");
vi.mock("../../../common/view-models/header.view-model.js");

const createMockPage = (data) => ({
  data,
  header: { navItems: [] },
});

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
    findUserRolesDataUseCase.mockResolvedValue({
      page: createMockPage({
        id: "user-123",
        name: "Martin Smith",
        appRoles: {
          PMF_READ: { startDate: "2025-07-01", endDate: "2025-08-02" },
          PMF_READ_WRITE: {},
        },
      }),
      roles: {
        header: { navItems: [] },
        data: [
          {
            id: "r2",
            code: "PMF_READ_WRITE",
            description: "Pigs Might Fly read write",
            assignable: false,
          },
          {
            id: "r1",
            code: "PMF_READ",
            description: "Pigs Might Fly read only",
            assignable: true,
          },
        ],
      },
    });

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/admin/user-management/users/user-123/roles",
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    expect($("#main-content").html()).toMatchSnapshot();

    expect($("input[value='PMF_READ']").attr("checked")).toBeDefined();
    expect($("input[value='PMF_READ_WRITE']").attr("checked")).toBeDefined();
  });

  it("returns 403 when backend forbids viewing roles", async () => {
    findUserRolesDataUseCase.mockRejectedValue(Boom.forbidden("Forbidden"));

    const { statusCode } = await server.inject({
      method: "GET",
      url: "/admin/user-management/users/user-123/roles",
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(403);
  });
});

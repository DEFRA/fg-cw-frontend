import Boom from "@hapi/boom";
import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { findUserByIdUseCase } from "../../../auth/use-cases/find-user-by-id.use-case.js";
import { nunjucks } from "../../../common/nunjucks/nunjucks.js";
import { viewUserRoute } from "./view-user.route.js";

vi.mock("../../../auth/use-cases/find-user-by-id.use-case.js");

describe("viewUserRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(viewUserRoute);
    await server.register([nunjucks]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("renders user details page", async () => {
    findUserByIdUseCase.mockResolvedValue({
      id: "user-123",
      name: "Martin Smith",
      email: "martin@ee.com",
      updatedAt: "2025-12-14T20:03:00.000Z",
      idpRoles: ["IDP_ROLE"],
      appRoles: {
        ROLE_RPA_CASES_APPROVE: {
          startDate: "2025-07-01",
          endDate: "2025-08-02",
        },
        ROLE_RPA_CASES_CREATE: {
          startDate: "2025-07-01",
          endDate: "2025-08-02",
        },
      },
    });

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/admin/user-management/user-123",
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });

  it("renders no roles messages when roles are missing", async () => {
    findUserByIdUseCase.mockResolvedValue({
      id: "user-123",
      name: "No Roles User",
      email: "noroles@example.com",
      idpRoles: [],
      appRoles: {},
    });

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/admin/user-management/user-123",
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });

  it("returns 403 when backend forbids viewing user", async () => {
    findUserByIdUseCase.mockRejectedValue(Boom.forbidden("Forbidden"));

    const { statusCode } = await server.inject({
      method: "GET",
      url: "/admin/user-management/user-123",
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(403);
  });
});

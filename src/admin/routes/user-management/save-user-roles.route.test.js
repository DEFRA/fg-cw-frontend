import Boom from "@hapi/boom";
import hapi from "@hapi/hapi";
import { load } from "cheerio";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { adminFindUserByIdUseCase } from "../../../auth/use-cases/admin-find-user-by-id.use-case.js";
import { nunjucks } from "../../../common/nunjucks/nunjucks.js";
import { findRolesUseCase } from "../../use-cases/find-roles.use-case.js";
import { updateUserRolesUseCase } from "../../use-cases/update-user-roles.use-case.js";
import { saveUserRolesRoute } from "./save-user-roles.route.js";

vi.mock("../../../auth/use-cases/admin-find-user-by-id.use-case.js");
vi.mock("../../use-cases/find-roles.use-case.js");
vi.mock("../../use-cases/update-user-roles.use-case.js");
vi.mock("../../../common/view-models/header.view-model.js");

const createMockPage = (data) => ({
  data,
  header: { navItems: [] },
});

describe("saveUserRolesRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(saveUserRolesRoute);
    await server.register([nunjucks]);
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  beforeEach(() => {
    adminFindUserByIdUseCase.mockResolvedValue(
      createMockPage({
        id: "user-123",
        name: "Martin Smith",
        appRoles: {
          PMF_READ: { startDate: "2025-07-01", endDate: "2025-08-02" },
        },
      }),
    );

    findRolesUseCase.mockResolvedValue({
      header: { navItems: [] },
      data: [
        { id: "r1", code: "PMF_READ", description: "Pigs Might Fly read only" },
        {
          id: "r2",
          code: "PMF_READ_WRITE",
          description: "Pigs Might Fly read write",
        },
      ],
    });
  });

  it("persists selected roles and redirects back to user details", async () => {
    updateUserRolesUseCase.mockResolvedValue();

    const { statusCode, headers } = await server.inject({
      method: "POST",
      url: "/admin/user-management/users/user-123/roles",
      payload: {
        roles: ["PMF_READ_WRITE"],
        startDate__PMF_READ_WRITE: "2026-01-01",
        endDate__PMF_READ_WRITE: "2026-02-01",
      },
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(updateUserRolesUseCase).toHaveBeenCalledWith(
      { token: "mock-token", user: { id: "admin-user" } },
      "user-123",
      {
        PMF_READ_WRITE: { startDate: "2026-01-01", endDate: "2026-02-01" },
      },
    );

    expect(statusCode).toEqual(302);
    expect(headers.location).toEqual("/admin/user-management/users/user-123");
  });

  it("shows validation error when start date is invalid", async () => {
    const { statusCode, result } = await server.inject({
      method: "POST",
      url: "/admin/user-management/users/user-123/roles",
      payload: {
        roles: ["PMF_READ"],
        startDate__PMF_READ: "not-a-date",
      },
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    expect($("#main-content").html()).toMatchSnapshot();

    expect($(".govuk-error-summary").text()).toContain("Invalid Start Date");
  });

  it("shows validation error when end date is invalid", async () => {
    const { statusCode, result } = await server.inject({
      method: "POST",
      url: "/admin/user-management/users/user-123/roles",
      payload: {
        roles: ["PMF_READ"],
        endDate__PMF_READ: "not-a-date",
      },
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    expect($("#main-content").html()).toMatchSnapshot();

    expect($(".govuk-error-summary").text()).toContain("Invalid End Date");
  });

  it("shows validation error when start date is after end date", async () => {
    const { statusCode, result } = await server.inject({
      method: "POST",
      url: "/admin/user-management/users/user-123/roles",
      payload: {
        roles: ["PMF_READ"],
        startDate__PMF_READ: "2026-09-01",
        endDate__PMF_READ: "2025-08-02",
      },
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    expect($("#main-content").html()).toMatchSnapshot();

    expect($(".govuk-error-summary").text()).toContain(
      "Start date cannot be after end date",
    );
    expect($("#startDate__PMF_READ-error").text()).toContain(
      "Start date cannot be after end date",
    );
  });

  it("shows validation error when end date is before start date", async () => {
    const { statusCode, result } = await server.inject({
      method: "POST",
      url: "/admin/user-management/users/user-123/roles",
      payload: {
        roles: ["PMF_READ"],
        startDate__PMF_READ: "2025-07-01",
        endDate__PMF_READ: "2025-01-01",
      },
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    expect($("#main-content").html()).toMatchSnapshot();

    expect($(".govuk-error-summary").text()).toContain(
      "End date cannot be before start date",
    );
    expect($("#endDate__PMF_READ-error").text()).toContain(
      "End date cannot be before start date",
    );
  });

  it("returns 403 when backend forbids saving", async () => {
    updateUserRolesUseCase.mockRejectedValue(Boom.forbidden("Forbidden"));

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/admin/user-management/users/user-123/roles",
      payload: {
        roles: ["PMF_READ"],
      },
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(403);
  });
});

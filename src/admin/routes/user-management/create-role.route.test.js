import Boom from "@hapi/boom";
import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { verifyAdminAccessUseCase } from "../../../auth/use-cases/verify-admin-access.use-case.js";
import { nunjucks } from "../../../common/nunjucks/nunjucks.js";
import { createRoleUseCase } from "../../use-cases/create-role.use-case.js";
import { createRoleRoute } from "./create-role.route.js";
import { newRoleRoute } from "./new-role.route.js";

vi.mock("../../../auth/use-cases/verify-admin-access.use-case.js");
vi.mock("../../use-cases/create-role.use-case.js");

const createMockPage = () => ({
  data: {},
  header: { navItems: [] },
});

describe("createRoleRoutes", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route([newRoleRoute, createRoleRoute]);
    await server.register([nunjucks]);
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("renders create role page", async () => {
    verifyAdminAccessUseCase.mockResolvedValue(createMockPage());

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/admin/user-management/roles/new",
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

  it("creates role and redirects to list", async () => {
    verifyAdminAccessUseCase.mockResolvedValue(createMockPage());
    createRoleUseCase.mockResolvedValue(undefined);

    const { statusCode, headers } = await server.inject({
      method: "POST",
      url: "/admin/user-management/roles",
      payload: {
        code: "ROLE_TEST",
        description: "Test role",
        assignable: "true",
      },
      auth: {
        credentials: { token: "mock-token", user: { id: "user-123" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(302);
    expect(headers.location).toEqual("/admin/user-management/roles");
  });

  it("renders validation errors when form is incomplete", async () => {
    verifyAdminAccessUseCase.mockResolvedValue(createMockPage());

    const { statusCode, result } = await server.inject({
      method: "POST",
      url: "/admin/user-management/roles",
      payload: {},
      auth: {
        credentials: { token: "mock-token", user: { id: "user-123" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);

    const errorSummary = $(".govuk-error-summary").text();
    expect(errorSummary).toContain("Enter a role code");
    expect(errorSummary).toContain("Enter a role description");
    expect(errorSummary).toContain("Select whether the role is assignable");
  });

  it("renders duplicate error when role code exists", async () => {
    verifyAdminAccessUseCase.mockResolvedValue(createMockPage());
    createRoleUseCase.mockRejectedValue(Boom.conflict("Duplicate"));

    const { statusCode, result } = await server.inject({
      method: "POST",
      url: "/admin/user-management/roles",
      payload: {
        code: "ROLE_DUPLICATE",
        description: "Duplicate role",
        assignable: "false",
      },
      auth: {
        credentials: { token: "mock-token", user: { id: "user-123" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    expect($(".govuk-error-summary").text()).toContain(
      "Role code already exists",
    );
  });

  it("renders validation error when role code contains invalid characters", async () => {
    verifyAdminAccessUseCase.mockResolvedValue(createMockPage());

    const { statusCode, result } = await server.inject({
      method: "POST",
      url: "/admin/user-management/roles",
      payload: {
        code: "ROLE-TEST",
        description: "Test role",
        assignable: "true",
      },
      auth: {
        credentials: { token: "mock-token", user: { id: "user-123" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    const summary = $(".govuk-error-summary").text();
    expect(summary).toContain(
      "Code can only contain letters, numbers and '_' (underscores).",
    );
    expect(summary).toContain("Code cannot start with '_' (underscore).");
  });

  it("renders validation error when role code starts with underscore", async () => {
    verifyAdminAccessUseCase.mockResolvedValue(createMockPage());

    const { statusCode, result } = await server.inject({
      method: "POST",
      url: "/admin/user-management/roles",
      payload: {
        code: "_ROLE_TEST",
        description: "Test role",
        assignable: "true",
      },
      auth: {
        credentials: { token: "mock-token", user: { id: "user-123" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);
    const $ = load(result);
    expect($(".govuk-error-summary").text()).toContain(
      "Code can only contain letters, numbers and '_' (underscores).  Code cannot start with '_' (underscore).",
    );
  });

  it("allows role code starting with number", async () => {
    verifyAdminAccessUseCase.mockResolvedValue(createMockPage());
    createRoleUseCase.mockResolvedValue(undefined);

    const { statusCode, headers } = await server.inject({
      method: "POST",
      url: "/admin/user-management/roles",
      payload: {
        code: "1ROLE_TEST",
        description: "Test role",
        assignable: "true",
      },
      auth: {
        credentials: { token: "mock-token", user: { id: "user-123" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(302);
    expect(headers.location).toEqual("/admin/user-management/roles");
    expect(createRoleUseCase).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ code: "1ROLE_TEST" }),
    );
  });
});

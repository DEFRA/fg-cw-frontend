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
import { nunjucks } from "../../../common/nunjucks/nunjucks.js";
import { findRoleUseCase } from "../../use-cases/find-role.use-case.js";
import { updateRoleUseCase } from "../../use-cases/update-role.use-case.js";
import { saveRoleRoute } from "./save-role.route.js";

vi.mock("../../use-cases/find-role.use-case.js");
vi.mock("../../use-cases/update-role.use-case.js");

const createMockRole = (role) => ({
  data: role,
  header: { navItems: [] },
});

describe("saveRoleRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(saveRoleRoute);
    await server.register([nunjucks]);
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  beforeEach(() => {
    findRoleUseCase.mockResolvedValue(
      createMockRole({
        code: "PMF_READ",
        description: "Read only",
        assignable: true,
      }),
    );
  });

  it("persists the role and redirects to the role list", async () => {
    updateRoleUseCase.mockResolvedValue();

    const { statusCode, headers } = await server.inject({
      method: "POST",
      url: "/admin/user-management/roles/PMF_READ",
      payload: {
        description: "Updated description",
        assignable: "false",
      },
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(updateRoleUseCase).toHaveBeenCalledWith(
      { token: "mock-token", user: { id: "admin-user" } },
      "PMF_READ",
      { description: "Updated description", assignable: false },
    );

    expect(statusCode).toEqual(302);
    expect(headers.location).toEqual("/admin/user-management/roles");
  });

  it("shows validation error when description is missing", async () => {
    const { statusCode, result } = await server.inject({
      method: "POST",
      url: "/admin/user-management/roles/PMF_READ",
      payload: {
        description: "",
        assignable: "true",
      },
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    expect($(".govuk-error-summary").text()).toContain("Enter a description");
    expect($(".govuk-error-message").text()).toContain("Enter a description");
  });

  it("shows validation error when assignable is missing", async () => {
    const { statusCode, result } = await server.inject({
      method: "POST",
      url: "/admin/user-management/roles/PMF_READ",
      payload: {
        description: "Updated description",
      },
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    expect($(".govuk-error-summary").text()).toContain(
      "Select whether the role is assignable",
    );
    expect($(".govuk-error-message").text()).toContain(
      "Select whether the role is assignable",
    );
  });

  it("returns 403 when backend forbids saving", async () => {
    updateRoleUseCase.mockRejectedValue(Boom.forbidden("Forbidden"));

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/admin/user-management/roles/PMF_READ",
      payload: {
        description: "Updated description",
        assignable: "true",
      },
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(403);
  });
});

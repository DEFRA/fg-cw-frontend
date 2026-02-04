import Boom from "@hapi/boom";
import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { nunjucks } from "../../../common/nunjucks/nunjucks.js";
import { findRoleUseCase } from "../../use-cases/find-role.use-case.js";
import { viewRoleRoute } from "./view-role.route.js";

vi.mock("../../use-cases/find-role.use-case.js");

const createMockRole = (role) => ({
  data: role,
  header: { navItems: [] },
});

describe("viewRoleRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(viewRoleRoute);
    await server.register([nunjucks]);
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("renders the role details page", async () => {
    findRoleUseCase.mockResolvedValue(
      createMockRole({
        code: "PMF_READ",
        description: "Read only",
        assignable: true,
      }),
    );

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/admin/user-management/roles/PMF_READ",
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    expect($("h1").text()).toEqual("Update PMF_READ");
    expect($("h3").first().next("p").text()).toEqual("PMF_READ");
    expect($("input[name='description']").val()).toEqual("Read only");
    expect(
      $("input[name='assignable'][value='true']").attr("checked"),
    ).toBeDefined();
  });

  it("returns 403 when backend forbids viewing role", async () => {
    findRoleUseCase.mockRejectedValue(Boom.forbidden("Forbidden"));

    const { statusCode } = await server.inject({
      method: "GET",
      url: "/admin/user-management/roles/PMF_READ",
      auth: {
        credentials: { token: "mock-token", user: { id: "admin-user" } },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(403);
  });
});

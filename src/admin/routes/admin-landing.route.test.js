import Boom from "@hapi/boom";
import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { verifyAdminAccessUseCase } from "../../auth/use-cases/verify-admin-access.use-case.js";
import { nunjucks } from "../../common/nunjucks/nunjucks.js";
import { adminLandingRoute } from "./admin-landing.route.js";

vi.mock("../../auth/use-cases/verify-admin-access.use-case.js");

describe("adminLandingRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(adminLandingRoute);
    await server.register([nunjucks]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("renders admin landing page", async () => {
    verifyAdminAccessUseCase.mockResolvedValue({ ok: true });

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/admin",
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

  it("renders page heading", async () => {
    verifyAdminAccessUseCase.mockResolvedValue({ ok: true });

    const { result } = await server.inject({
      method: "GET",
      url: "/admin",
      auth: {
        credentials: { token: "mock-token" },
        strategy: "session",
      },
    });

    const $ = load(result);
    expect($("h1").text()).toEqual("Users and roles");
  });

  it("renders Manage users link", async () => {
    verifyAdminAccessUseCase.mockResolvedValue({ ok: true });

    const { result } = await server.inject({
      method: "GET",
      url: "/admin",
      auth: {
        credentials: { token: "mock-token" },
        strategy: "session",
      },
    });

    const $ = load(result);
    expect($("a[href='/admin/user-management']").text()).toEqual(
      "Manage users",
    );
  });

  it("renders Manage roles link", async () => {
    verifyAdminAccessUseCase.mockResolvedValue({ ok: true });

    const { result } = await server.inject({
      method: "GET",
      url: "/admin",
      auth: {
        credentials: { token: "mock-token" },
        strategy: "session",
      },
    });

    const $ = load(result);
    expect($("a[href='/admin/user-management/roles-list']").text()).toEqual(
      "Manage roles",
    );
  });

  it("passes auth context to verifyAdminAccessUseCase", async () => {
    verifyAdminAccessUseCase.mockResolvedValue({ ok: true });

    await server.inject({
      method: "GET",
      url: "/admin",
      auth: {
        credentials: { token: "mock-token", user: { id: "user-123" } },
        strategy: "session",
      },
    });

    expect(verifyAdminAccessUseCase).toHaveBeenCalledWith({
      token: "mock-token",
      user: { id: "user-123" },
    });
  });

  it("returns 403 when backend forbids access", async () => {
    verifyAdminAccessUseCase.mockRejectedValue(Boom.forbidden("Forbidden"));

    const { statusCode } = await server.inject({
      method: "GET",
      url: "/admin",
      auth: {
        credentials: { token: "mock-token" },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(403);
  });
});

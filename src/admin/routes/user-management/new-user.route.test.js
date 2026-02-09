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
import { verifyAdminAccessUseCase } from "../../../auth/use-cases/verify-admin-access.use-case.js";
import { nunjucks } from "../../../common/nunjucks/nunjucks.js";
import { newUserRoute } from "./new-user.route.js";

vi.mock("../../../auth/use-cases/verify-admin-access.use-case.js");
vi.mock("../../../common/view-models/header.view-model.js");

const createMockPage = () => ({
  data: {},
  header: { navItems: [] },
});

describe("newUserRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route([newUserRoute]);
    await server.register([nunjucks]);

    await server.initialize();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    verifyAdminAccessUseCase.mockResolvedValue(createMockPage());
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("GET /admin/user-management/users/new", () => {
    it("renders create user form", async () => {
      const { statusCode, result } = await server.inject({
        method: "GET",
        url: "/admin/user-management/users/new",
        auth: {
          credentials: { token: "mock-token", user: { id: "admin-user" } },
          strategy: "session",
        },
      });

      expect(statusCode).toEqual(200);

      const $ = load(result);
      expect($("h1").text()).toContain("Create user");
      expect($("#name").length).toBe(1);
      expect($("#email").length).toBe(1);
    });

    it("passes auth context to verifyAdminAccessUseCase", async () => {
      await server.inject({
        method: "GET",
        url: "/admin/user-management/users/new",
        auth: {
          credentials: { token: "mock-token", user: { id: "admin-user" } },
          strategy: "session",
        },
      });

      expect(verifyAdminAccessUseCase).toHaveBeenCalledWith({
        token: "mock-token",
        user: { id: "admin-user" },
      });
    });

    it("returns 403 when admin verification fails", async () => {
      verifyAdminAccessUseCase.mockRejectedValue(Boom.forbidden("Forbidden"));

      const { statusCode } = await server.inject({
        method: "GET",
        url: "/admin/user-management/users/new",
        auth: {
          credentials: { token: "mock-token", user: { id: "admin-user" } },
          strategy: "session",
        },
      });

      expect(statusCode).toEqual(403);
    });
  });
});

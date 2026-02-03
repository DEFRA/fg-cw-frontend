import Boom from "@hapi/boom";
import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { adminCreateUserUseCase } from "../../../auth/use-cases/admin-create-user.use-case.js";
import { nunjucks } from "../../../common/nunjucks/nunjucks.js";
import {
  getCreateUserRoute,
  postCreateUserRoute,
} from "./create-user.route.js";

vi.mock("../../../auth/use-cases/admin-create-user.use-case.js");

const createMockResponse = (data) => ({
  data,
  header: { navItems: [] },
});

describe("createUserRoutes", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route([getCreateUserRoute, postCreateUserRoute]);
    await server.register([nunjucks]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("GET /admin/user-management/create", () => {
    it("renders create user form", async () => {
      const { statusCode, result } = await server.inject({
        method: "GET",
        url: "/admin/user-management/create",
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
  });

  describe("POST /admin/user-management/create", () => {
    it("redirects to user details on successful creation", async () => {
      adminCreateUserUseCase.mockResolvedValue(
        createMockResponse({
          id: "new-user-123",
          name: "New User",
          email: "new@example.com",
        }),
      );

      const { statusCode, headers } = await server.inject({
        method: "POST",
        url: "/admin/user-management/create",
        payload: {
          name: "New User",
          email: "new@example.com",
        },
        auth: {
          credentials: { token: "mock-token", user: { id: "admin-user" } },
          strategy: "session",
        },
      });

      expect(statusCode).toEqual(302);
      expect(headers.location).toBe("/admin/user-management/new-user-123");
    });

    it("shows error when name is empty", async () => {
      const { statusCode, result } = await server.inject({
        method: "POST",
        url: "/admin/user-management/create",
        payload: {
          name: "",
          email: "test@example.com",
        },
        auth: {
          credentials: { token: "mock-token", user: { id: "admin-user" } },
          strategy: "session",
        },
      });

      expect(statusCode).toEqual(200);

      const $ = load(result);
      expect($(".govuk-error-summary").length).toBe(1);
      expect(result).toContain("Enter a name");
    });

    it("shows error when name is too short", async () => {
      const { statusCode, result } = await server.inject({
        method: "POST",
        url: "/admin/user-management/create",
        payload: {
          name: "A",
          email: "test@example.com",
        },
        auth: {
          credentials: { token: "mock-token", user: { id: "admin-user" } },
          strategy: "session",
        },
      });

      expect(statusCode).toEqual(200);

      const $ = load(result);
      expect($(".govuk-error-summary").length).toBe(1);
      expect(result).toContain("Enter a name with at least 2 characters");
    });

    it("shows error when email is empty", async () => {
      const { statusCode, result } = await server.inject({
        method: "POST",
        url: "/admin/user-management/create",
        payload: {
          name: "Test User",
          email: "",
        },
        auth: {
          credentials: { token: "mock-token", user: { id: "admin-user" } },
          strategy: "session",
        },
      });

      expect(statusCode).toEqual(200);

      const $ = load(result);
      expect($(".govuk-error-summary").length).toBe(1);
      expect(result).toContain("Enter an email address");
    });

    it("shows error when email is invalid", async () => {
      const { statusCode, result } = await server.inject({
        method: "POST",
        url: "/admin/user-management/create",
        payload: {
          name: "Test User",
          email: "invalid-email",
        },
        auth: {
          credentials: { token: "mock-token", user: { id: "admin-user" } },
          strategy: "session",
        },
      });

      expect(statusCode).toEqual(200);

      const $ = load(result);
      expect($(".govuk-error-summary").length).toBe(1);
      expect(result).toContain("Enter a valid email address");
    });

    it("shows error when email already exists", async () => {
      const error = Boom.conflict("Email exists");
      error.output.statusCode = 409;
      adminCreateUserUseCase.mockRejectedValue(error);

      const { statusCode, result } = await server.inject({
        method: "POST",
        url: "/admin/user-management/create",
        payload: {
          name: "Test User",
          email: "existing@example.com",
        },
        auth: {
          credentials: { token: "mock-token", user: { id: "admin-user" } },
          strategy: "session",
        },
      });

      expect(statusCode).toEqual(200);

      const $ = load(result);
      expect($(".govuk-error-summary").length).toBe(1);
      expect(result).toContain("A user with this email address already exists");
    });

    it("returns 403 when user is forbidden", async () => {
      adminCreateUserUseCase.mockRejectedValue(Boom.forbidden("Forbidden"));

      const { statusCode } = await server.inject({
        method: "POST",
        url: "/admin/user-management/create",
        payload: {
          name: "Test User",
          email: "test@example.com",
        },
        auth: {
          credentials: { token: "mock-token", user: { id: "admin-user" } },
          strategy: "session",
        },
      });

      expect(statusCode).toEqual(403);
    });

    it("shows generic error on server failure", async () => {
      adminCreateUserUseCase.mockRejectedValue(new Error("Server error"));

      const { statusCode, result } = await server.inject({
        method: "POST",
        url: "/admin/user-management/create",
        payload: {
          name: "Test User",
          email: "test@example.com",
        },
        auth: {
          credentials: { token: "mock-token", user: { id: "admin-user" } },
          strategy: "session",
        },
      });

      expect(statusCode).toEqual(200);

      const $ = load(result);
      expect($(".govuk-error-summary").length).toBe(1);
      expect(result).toContain("There was a problem creating the user");
    });
  });
});

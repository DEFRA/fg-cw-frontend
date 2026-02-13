import Boom from "@hapi/boom";
import hapi from "@hapi/hapi";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { config } from "../../common/config.js";
import { logger } from "../../common/logger.js";
import { errors } from "./errors.js";

vi.mock("../../common/config.js", () => ({
  config: {
    get: vi.fn(),
  },
}));

vi.mock("../../common/logger.js", () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("errors plugin", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();

    // Mock view rendering
    server.decorate("toolkit", "view", function (template, context) {
      return this.response({ template, context });
    });

    await server.register(errors);

    // Route that returns a normal response (non-boom)
    server.route({
      method: "GET",
      path: "/success",
      handler: () => ({ status: "ok" }),
    });

    // Route that throws 400 Bad Request
    server.route({
      method: "GET",
      path: "/bad-request",
      handler: () => {
        throw Boom.badRequest("Invalid input");
      },
    });

    // Route that throws 401 Unauthorized
    server.route({
      method: "GET",
      path: "/unauthorized",
      handler: () => {
        throw Boom.unauthorized("Not authenticated");
      },
    });

    // Route that throws 403 Forbidden
    server.route({
      method: "GET",
      path: "/forbidden",
      handler: () => {
        throw Boom.forbidden("Access denied");
      },
    });

    // Route that throws 404 Not Found
    server.route({
      method: "GET",
      path: "/not-found",
      handler: () => {
        throw Boom.notFound("Resource not found");
      },
    });

    // Route that throws 500 Internal Server Error
    server.route({
      method: "GET",
      path: "/server-error",
      handler: () => {
        throw Boom.internal("Server crashed");
      },
    });

    // Route that throws 502 Bad Gateway
    server.route({
      method: "GET",
      path: "/bad-gateway",
      handler: () => {
        throw Boom.badGateway("Upstream failed");
      },
    });

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("non-boom responses", () => {
    it("should continue without modification for non-boom responses", async () => {
      const response = await server.inject({
        method: "GET",
        url: "/success",
      });

      expect(response.statusCode).toBe(200);
      expect(response.result).toEqual({ status: "ok" });
    });
  });

  describe("403 Forbidden", () => {
    it("should render pages/403 with specific view model", async () => {
      config.get.mockReturnValue(false);

      const response = await server.inject({
        method: "GET",
        url: "/forbidden",
      });

      expect(response.statusCode).toBe(403);
      expect(response.result.template).toBe("pages/403");
      expect(response.result.context).toEqual({
        pageTitle: "You do not have access to this page",
        pageHeading: "You do not have access to this page",
      });
    });

    it("should log 403 as warn level", async () => {
      config.get.mockReturnValue(false);
      logger.warn.mockClear();

      await server.inject({
        method: "GET",
        url: "/forbidden",
      });

      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe("log level branching", () => {
    it("should not log 404 errors", async () => {
      config.get.mockReturnValue(false);
      logger.warn.mockClear();
      logger.error.mockClear();

      await server.inject({
        method: "GET",
        url: "/not-found",
      });

      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("should log 400 errors as warn level", async () => {
      config.get.mockReturnValue(false);
      logger.warn.mockClear();

      await server.inject({
        method: "GET",
        url: "/bad-request",
      });

      expect(logger.warn).toHaveBeenCalled();
    });

    it("should log 401 errors as warn level", async () => {
      config.get.mockReturnValue(false);
      logger.warn.mockClear();

      await server.inject({
        method: "GET",
        url: "/unauthorized",
      });

      expect(logger.warn).toHaveBeenCalled();
    });

    it("should log 500 errors as error level", async () => {
      config.get.mockReturnValue(false);
      logger.error.mockClear();

      await server.inject({
        method: "GET",
        url: "/server-error",
      });

      expect(logger.error).toHaveBeenCalled();
    });

    it("should log 502 errors as error level", async () => {
      config.get.mockReturnValue(false);
      logger.error.mockClear();

      await server.inject({
        method: "GET",
        url: "/bad-gateway",
      });

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe("error messages", () => {
    it("should use 'Bad Request' message for 400", async () => {
      config.get.mockReturnValue(false);

      const response = await server.inject({
        method: "GET",
        url: "/bad-request",
      });

      expect(response.statusCode).toBe(400);
      expect(response.result.template).toBe("pages/error");
      expect(response.result.context.message).toBe("Bad Request");
    });

    it("should use 'Unauthorized' message for 401", async () => {
      config.get.mockReturnValue(false);

      const response = await server.inject({
        method: "GET",
        url: "/unauthorized",
      });

      expect(response.statusCode).toBe(401);
      expect(response.result.template).toBe("pages/error");
      expect(response.result.context.message).toBe("Unauthorized");
    });

    it("should use 'Page not found' message for 404", async () => {
      config.get.mockReturnValue(false);

      const response = await server.inject({
        method: "GET",
        url: "/not-found",
      });

      expect(response.statusCode).toBe(404);
      expect(response.result.template).toBe("pages/error");
      expect(response.result.context.message).toBe("Page not found");
    });

    it("should use 'Something went wrong' fallback for unknown status codes", async () => {
      config.get.mockReturnValue(false);

      const response = await server.inject({
        method: "GET",
        url: "/server-error",
      });

      expect(response.statusCode).toBe(500);
      expect(response.result.template).toBe("pages/error");
      expect(response.result.context.message).toBe("Something went wrong");
    });

    it("should use 'Something went wrong' fallback for 502", async () => {
      config.get.mockReturnValue(false);

      const response = await server.inject({
        method: "GET",
        url: "/bad-gateway",
      });

      expect(response.statusCode).toBe(502);
      expect(response.result.template).toBe("pages/error");
      expect(response.result.context.message).toBe("Something went wrong");
    });
  });

  describe("production mode error details", () => {
    it("should hide error details in production mode", async () => {
      config.get.mockReturnValue(true);

      const response = await server.inject({
        method: "GET",
        url: "/server-error",
      });

      expect(response.result.context.error).toBeNull();
    });

    it("should show error details in non-production mode", async () => {
      config.get.mockReturnValue(false);

      const response = await server.inject({
        method: "GET",
        url: "/server-error",
      });

      expect(response.result.context.error).not.toBeNull();
      expect(response.result.context.error.isBoom).toBe(true);
    });
  });

  describe("error page view model", () => {
    it("should set correct pageTitle and pageHeading", async () => {
      config.get.mockReturnValue(false);

      const response = await server.inject({
        method: "GET",
        url: "/bad-request",
      });

      expect(response.result.context.pageTitle).toBe("Error");
      expect(response.result.context.pageHeading).toBe(400);
    });
  });
});

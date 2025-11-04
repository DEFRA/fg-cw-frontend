import { beforeEach, describe, expect, test, vi } from "vitest";
import * as proxyUseCase from "../use-cases/proxy-to-agreements.use-case.js";
import { agreementsProxyRoutes } from "./agreements-proxy.route.js";

describe("agreementsProxyRoute", () => {
  test("should export routes array with GET method", () => {
    expect(Array.isArray(agreementsProxyRoutes)).toBe(true);
    expect(agreementsProxyRoutes).toHaveLength(1);
    expect(agreementsProxyRoutes[0].method).toBe("GET");
    expect(agreementsProxyRoutes[0].path).toContain("/agreement/");
  });

  test("should have correct handler function", () => {
    expect(typeof agreementsProxyRoutes[0].handler).toBe("function");
    expect(agreementsProxyRoutes[0].options.auth.mode).toBe("required");
    expect(agreementsProxyRoutes[0].options.auth.strategy).toBe("session");
  });

  describe("handler function", () => {
    let mockH;

    beforeEach(() => {
      mockH = {
        response: vi.fn(() => mockH),
        code: vi.fn(() => ({ success: true, statusCode: 200 })),
      };
    });

    test("should return 400 when path is missing", async () => {
      const handler = agreementsProxyRoutes[0].handler;
      const mockRequest = { params: {} };

      await handler(mockRequest, mockH);

      expect(mockH.response).toHaveBeenCalledWith({
        error: "Bad Request",
        message: "Path parameter is required",
      });
      expect(mockH.code).toHaveBeenCalledWith(400);
    });

    test("should call proxyToAgreements and return proxy response", async () => {
      const mockProxy = vi.fn().mockResolvedValue({
        success: true,
        statusCode: 200,
      });

      mockH.proxy = mockProxy;

      const proxySpy = vi.spyOn(proxyUseCase, "proxyToAgreements");
      proxySpy.mockReturnValue({
        uri: "http://test.com/path",
        headers: { Authorization: "Bearer token" },
      });

      const handler = agreementsProxyRoutes[0].handler;
      const mockRequest = { params: { path: "test-path" } };

      await handler(mockRequest, mockH);

      expect(proxySpy).toHaveBeenCalledWith("test-path", mockRequest);
      expect(mockProxy).toHaveBeenCalled();
    });

    test("should return 502 when proxy response is null", async () => {
      const mockProxy = vi.fn().mockResolvedValue(null);
      mockH.proxy = mockProxy;

      vi.spyOn(proxyUseCase, "proxyToAgreements").mockReturnValue({
        uri: "http://test.com/path",
        headers: {},
      });

      const handler = agreementsProxyRoutes[0].handler;
      const mockRequest = { params: { path: "test" } };

      await handler(mockRequest, mockH);

      expect(mockH.response).toHaveBeenCalledWith({
        error: "No response from upstream service",
        message: "The agreements UI did not return any data",
      });
      expect(mockH.code).toHaveBeenCalledWith(502);
    });

    test("should return 503 for configuration errors", async () => {
      vi.spyOn(proxyUseCase, "proxyToAgreements").mockImplementation(() => {
        const error = new Error("Missing required configuration");
        throw error;
      });

      const handler = agreementsProxyRoutes[0].handler;
      const mockRequest = { params: { path: "test" } };

      await handler(mockRequest, mockH);

      expect(mockH.response).toHaveBeenCalledWith({
        error: "Service Configuration Error",
        message: "Service temporarily unavailable",
      });
      expect(mockH.code).toHaveBeenCalledWith(503);
    });

    test("should return 503 for generic errors", async () => {
      vi.spyOn(proxyUseCase, "proxyToAgreements").mockImplementation(() => {
        throw new Error("Generic error");
      });

      const handler = agreementsProxyRoutes[0].handler;
      const mockRequest = { params: { path: "test" } };

      await handler(mockRequest, mockH);

      expect(mockH.response).toHaveBeenCalledWith({
        error: "External Service Unavailable",
        message: "Unable to process request",
      });
      expect(mockH.code).toHaveBeenCalledWith(503);
    });

    test("should use error.statusCode when available", async () => {
      vi.spyOn(proxyUseCase, "proxyToAgreements").mockImplementation(() => {
        const error = new Error("Not found");
        error.statusCode = 404;
        throw error;
      });

      const handler = agreementsProxyRoutes[0].handler;
      const mockRequest = { params: { path: "test" } };

      await handler(mockRequest, mockH);

      expect(mockH.code).toHaveBeenCalledWith(404);
    });

    test("should use error.output.statusCode when available", async () => {
      vi.spyOn(proxyUseCase, "proxyToAgreements").mockImplementation(() => {
        const error = new Error("Server error");
        error.output = { statusCode: 500 };
        throw error;
      });

      const handler = agreementsProxyRoutes[0].handler;
      const mockRequest = { params: { path: "test" } };

      await handler(mockRequest, mockH);

      expect(mockH.code).toHaveBeenCalledWith(500);
    });
  });
});

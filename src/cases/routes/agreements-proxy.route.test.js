import Jwt from "@hapi/jwt";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { config } from "../../common/config.js";
import { wreck } from "../../common/wreck.js";
import * as proxyUseCase from "../use-cases/proxy-to-agreements.use-case.js";
import { agreementsProxyRoutes } from "./agreements-proxy.route.js";

describe("agreementsProxyRoute", () => {
  test("exports authenticated legacy and case-aware proxy routes", () => {
    expect(agreementsProxyRoutes).toHaveLength(2);
    expect(
      agreementsProxyRoutes.map(({ method, path }) => [method, path]),
    ).toEqual([
      ["GET", "/agreement/{path*}"],
      ["GET", "/cases/{caseId}/agreement/{agreementRef}"],
    ]);

    for (const route of agreementsProxyRoutes) {
      expect(route.options.auth).toEqual({
        mode: "required",
        strategy: "session",
      });
    }
  });

  describe("handler function", () => {
    let mockH;
    let handler;

    beforeEach(() => {
      mockH = {
        response: vi.fn(() => mockH),
        code: vi.fn(() => ({ success: true, statusCode: 200 })),
      };
      handler = agreementsProxyRoutes[0].handler;
      vi.restoreAllMocks();
    });

    test("should return 400 when path is missing", async () => {
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

      const mockRequest = { params: { path: "test-path" } };

      await handler(mockRequest, mockH);

      expect(proxySpy).toHaveBeenCalledWith({
        path: "test-path",
        request: mockRequest,
      });
      expect(mockProxy).toHaveBeenCalled();
    });

    test("should return 502 when proxy response is null", async () => {
      const mockProxy = vi.fn().mockResolvedValue(null);
      mockH.proxy = mockProxy;

      vi.spyOn(proxyUseCase, "proxyToAgreements").mockReturnValue({
        uri: "http://test.com/path",
        headers: {},
      });

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

      const mockRequest = { params: { path: "test" } };

      await handler(mockRequest, mockH);

      expect(mockH.code).toHaveBeenCalledWith(500);
    });

    test("should log upstream response details when proxy succeeds", async () => {
      const info = vi.fn();
      const warn = vi.fn();
      const mockLogger = { info, warn };

      const proxySpy = vi
        .spyOn(proxyUseCase, "proxyToAgreements")
        .mockReturnValue({
          uri: "https://service.test/path",
          headers: { Authorization: "Bearer token" },
        });

      mockH.proxy = vi.fn(async (options) => {
        options.onResponse(null, {
          statusCode: 204,
          headers: { "content-type": "application/json" },
        });
        return { ok: true };
      });

      const mockRequest = { params: { path: "success" }, logger: mockLogger };

      const response = await handler(mockRequest, mockH);

      expect(proxySpy).toHaveBeenCalledWith({
        path: "success",
        request: mockRequest,
      });
      expect(info).toHaveBeenCalledWith(
        {
          agreementProxyTarget: "https://service.test/path",
          upstreamStatusCode: 204,
          upstreamHeaders: {
            "content-type": "application/json",
            "www-authenticate": undefined,
          },
        },
        "Agreements proxy upstream response",
      );
      expect(response).toEqual({ ok: true });
    });

    test("should warn and rethrow when upstream response handler receives an error", async () => {
      const warn = vi.fn();
      const mockLogger = { info: vi.fn(), warn };

      vi.spyOn(proxyUseCase, "proxyToAgreements").mockReturnValue({
        uri: "https://service.test/path",
        headers: {},
      });

      const proxyError = new Error("Upstream failure");
      mockH.proxy = vi.fn(async (options) => {
        expect(() => options.onResponse(proxyError)).toThrow(proxyError);
        return { failed: true };
      });

      const mockRequest = { params: { path: "error" }, logger: mockLogger };

      await handler(mockRequest, mockH);

      expect(warn).toHaveBeenCalledWith(
        {
          agreementProxyTarget: "https://service.test/path",
          error: "Upstream failure",
        },
        "Agreements proxy upstream response error",
      );
    });

    test("should use request logger when proxy rejects", async () => {
      const warn = vi.fn();
      const mockLogger = { warn, info: vi.fn() };

      vi.spyOn(proxyUseCase, "proxyToAgreements").mockReturnValue({
        uri: "https://service.test/path",
        headers: {},
      });

      mockH.proxy = vi.fn(() => Promise.reject(new Error("Proxy broke")));

      const mockRequest = { params: { path: "failure" }, logger: mockLogger };

      await handler(mockRequest, mockH);

      expect(warn).toHaveBeenCalledWith(
        expect.objectContaining({
          agreementProxyPath: "failure",
          error: "Proxy broke",
          isBoom: false,
        }),
        "Agreements proxy encountered an error",
      );
      expect(mockH.response).toHaveBeenCalled();
    });
  });

  describe("case agreement handler", () => {
    let mockH;
    let handler;

    beforeEach(() => {
      mockH = {
        proxy: vi.fn().mockResolvedValue({ statusCode: 200 }),
        response: vi.fn(() => mockH),
        code: vi.fn(() => ({ success: true, statusCode: 200 })),
      };
      handler = agreementsProxyRoutes[1].handler;
      vi.restoreAllMocks();
    });

    test("gets trusted case context before proxying the agreement", async () => {
      const proxySpy = vi
        .spyOn(proxyUseCase, "proxyCaseAgreement")
        .mockResolvedValue({
          uri: "http://localhost:3000/WMP936292242",
          headers: { "x-encrypted-auth": "signed-case-token" },
        });
      const request = {
        params: {
          caseId: "6a69fb35c9339ac5a18a89f0",
          agreementRef: "WMP936292242",
        },
      };

      await handler(request, mockH);

      expect(proxySpy).toHaveBeenCalledWith(
        "6a69fb35c9339ac5a18a89f0",
        "WMP936292242",
        request,
      );
      expect(mockH.proxy).toHaveBeenCalledWith(
        expect.objectContaining({
          mapUri: expect.any(Function),
          passThrough: true,
          rejectUnauthorized: true,
        }),
      );
      expect(mockH.proxy.mock.calls[0][0].mapUri()).toEqual({
        uri: "http://localhost:3000/WMP936292242",
        headers: { "x-encrypted-auth": "signed-case-token" },
      });
    });

    test("signs the trusted case workflow code through the composed route", async () => {
      vi.spyOn(wreck, "get").mockResolvedValue({
        payload: { data: { workflowCode: "pigs-might-fly" } },
      });
      const request = {
        params: {
          caseId: "6a69fb35c9339ac5a18a89f0",
          agreementRef: "PMF823153883",
        },
        auth: {
          credentials: {
            token: "caseworking-token",
            user: { id: "caseworker-1" },
            sbi: "123456789",
          },
        },
        headers: {},
        app: { cspNonce: "test-nonce" },
        info: { id: "test-id" },
      };

      await handler(request, mockH);

      const { uri, headers } = mockH.proxy.mock.calls[0][0].mapUri();
      const jwt = Jwt.token.decode(headers["x-encrypted-auth"]);
      Jwt.token.verifySignature(jwt, config.get("agreements.jwtSecret"));

      expect(wreck.get).toHaveBeenCalledWith(
        "/cases/6a69fb35c9339ac5a18a89f0",
        {
          headers: { authorization: "Bearer caseworking-token" },
        },
      );
      expect(uri).toBe(`${config.get("agreements.uiUrl")}/PMF823153883`);
      expect(jwt.decoded.payload).toMatchObject({
        source: "entra",
        sbi: "123456789",
        grantCode: "pigs-might-fly",
      });
    });

    test("returns a safe error when case context cannot be loaded", async () => {
      vi.spyOn(proxyUseCase, "proxyCaseAgreement").mockRejectedValue(
        new Error("Case workflow code is unavailable"),
      );
      const request = {
        params: {
          caseId: "case-123",
          agreementRef: "PMF823153883",
        },
      };

      await handler(request, mockH);

      expect(mockH.response).toHaveBeenCalledWith({
        error: "External Service Unavailable",
        message: "Unable to process request",
      });
      expect(mockH.code).toHaveBeenCalledWith(503);
    });
  });
});

import Jwt from "@hapi/jwt";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { config } from "../../common/config.js";
import * as proxyUseCase from "../use-cases/proxy-to-agreements.use-case.js";
import { agreementsProxyRoutes } from "./agreements-proxy.route.js";

const proxyAgreementRequest = async function (path) {
  let proxyOptions;
  const h = {
    proxy: vi.fn(async (options) => {
      proxyOptions = options;
      return { statusCode: 200 };
    }),
  };
  const request = {
    params: { path },
    auth: { credentials: { sbi: "123456789" } },
    headers: {},
    app: { cspNonce: "test-nonce" },
    info: { id: "test-request-id" },
  };

  await agreementsProxyRoutes[0].handler(request, h);

  const mappedRequest = proxyOptions.mapUri();
  const jwt = Jwt.token.decode(mappedRequest.headers["x-encrypted-auth"]);
  Jwt.token.verifySignature(jwt, "route-level-test-secret");

  return {
    mappedRequest,
    payload: jwt.decoded.payload,
  };
};

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

  describe("signed Agreements authentication", () => {
    const originalGrantCode = config.get("agreements.pmfGrantCode");
    const originalJwtSecret = config.get("agreements.jwtSecret");

    beforeEach(() => {
      vi.restoreAllMocks();
      config.set("agreements.pmfGrantCode", "configured-test-grant");
      config.set("agreements.jwtSecret", "route-level-test-secret");
    });

    afterAll(() => {
      config.set("agreements.pmfGrantCode", originalGrantCode);
      config.set("agreements.jwtSecret", originalJwtSecret);
    });

    test.each(["PMF823153883", "PMF823153883/print"])(
      "maps %s with the configured grant code in a valid JWT",
      async (path) => {
        const { mappedRequest, payload } = await proxyAgreementRequest(path);

        expect(mappedRequest.uri).toBe(`http://localhost:3000/${path}`);
        expect(mappedRequest.headers).toMatchObject({
          Authorization: "Bearer default-agreements-ui-token",
          "x-base-url": "/agreement",
          "x-csp-nonce": "test-nonce",
        });
        expect(payload).toEqual({
          source: "entra",
          sbi: "123456789",
          grantCode: "configured-test-grant",
          iat: expect.any(Number),
        });
      },
    );

    test.each(["WMP123456789", "FPTT123456789/print"])(
      "maps legacy path %s without changing its JWT claims",
      async (path) => {
        const { mappedRequest, payload } = await proxyAgreementRequest(path);

        expect(mappedRequest.uri).toBe(`http://localhost:3000/${path}`);
        expect(payload).toEqual({
          source: "entra",
          sbi: "123456789",
          iat: expect.any(Number),
        });
      },
    );
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

      expect(proxySpy).toHaveBeenCalledWith("success", mockRequest);
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
});

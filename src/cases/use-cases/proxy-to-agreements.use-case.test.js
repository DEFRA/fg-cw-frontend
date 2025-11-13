import { beforeEach, describe, expect, test, vi } from "vitest";
import * as proxyUseCase from "./proxy-to-agreements.use-case.js";

// Mock config
vi.mock("../../common/config.js", () => ({
  config: {
    get: vi.fn((key) => {
      const values = {
        "agreements.uiUrl": "http://localhost:3000",
        "agreements.uiToken": "test-token",
        "agreements.jwtSecret": "test-secret",
        "agreements.baseUrl": "/agreement",
      };
      return values[key];
    }),
  },
}));

// Mock JWT helper
vi.mock("../../common/helpers/agreements-jwt.js", () => ({
  generateAgreementsJwt: vi.fn(() => "mock-jwt-token"),
}));

// Mock logger
vi.mock("../../common/logger.js", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("proxyToAgreements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return uri and headers with JWT when SBI exists", () => {
    const mockRequest = {
      auth: { credentials: { sbi: "123456789" } },
      headers: { "content-type": "application/json" },
      app: { cspNonce: "test-nonce" },
      info: { id: "test-id" },
    };

    const result = proxyUseCase.proxyToAgreements("test-path", mockRequest);

    expect(result.uri).toBe("http://localhost:3000/test-path");
    expect(result.headers.Authorization).toBe("Bearer test-token");
    expect(result.headers["x-base-url"]).toBe("/agreement");
    expect(result.headers["x-csp-nonce"]).toBe("test-nonce");
    expect(result.headers["x-encrypted-auth"]).toBe("mock-jwt-token");
  });

  test("should return uri and headers with JWT even when no SBI (entra source)", () => {
    const mockRequest = {
      auth: { credentials: {} },
      headers: { "content-type": "application/json" },
      app: { cspNonce: "test-nonce" },
      info: { id: "test-id" },
    };

    const result = proxyUseCase.proxyToAgreements("test-path", mockRequest);

    expect(result.uri).toBe("http://localhost:3000/test-path");
    expect(result.headers["x-encrypted-auth"]).toBe("mock-jwt-token");
  });

  test("should handle paths with leading slash", () => {
    const mockRequest = {
      auth: { credentials: {} },
      headers: {},
      app: { cspNonce: "test-nonce" },
      info: { id: "test-id" },
    };

    const result = proxyUseCase.proxyToAgreements("/test-path", mockRequest);
    expect(result.uri).toBe("http://localhost:3000/test-path");
  });

  test("should use default content-type when not provided", () => {
    const mockRequest = {
      auth: { credentials: {} },
      headers: {},
      app: { cspNonce: "test-nonce" },
      info: { id: "test-id" },
    };

    const result = proxyUseCase.proxyToAgreements("test", mockRequest);
    expect(result.headers["content-type"]).toBe("text/html");
  });

  test("should use correlation headers from request when available", () => {
    const mockRequest = {
      auth: { credentials: {} },
      headers: {
        "x-request-id": "custom-request-id",
        "x-correlation-id": "custom-correlation-id",
      },
      app: { cspNonce: "test-nonce" },
      info: { id: "default-id" },
    };

    const result = proxyUseCase.proxyToAgreements("test", mockRequest);

    expect(result.headers["X-Request-ID"]).toBe("custom-request-id");
    expect(result.headers["X-Correlation-ID"]).toBe("custom-correlation-id");
  });

  test("should use info.id for correlation when headers not provided", () => {
    const mockRequest = {
      auth: { credentials: {} },
      headers: {},
      app: { cspNonce: "test-nonce" },
      info: { id: "default-id" },
    };

    const result = proxyUseCase.proxyToAgreements("test", mockRequest);

    expect(result.headers["X-Request-ID"]).toBe("default-id");
    expect(result.headers["X-Correlation-ID"]).toBe("default-id");
  });

  test("should handle empty path", () => {
    const mockRequest = {
      auth: { credentials: {} },
      headers: {},
      app: { cspNonce: "test-nonce" },
      info: { id: "test-id" },
    };

    const result = proxyUseCase.proxyToAgreements("", mockRequest);
    expect(result.uri).toBe("http://localhost:3000");
  });
});

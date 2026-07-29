import { beforeEach, describe, expect, test, vi } from "vitest";
import { generateAgreementsJwt } from "../../common/helpers/agreements-jwt.js";
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
    expect(generateAgreementsJwt).toHaveBeenCalledWith("123456789", undefined);
  });

  test.each([
    ["ALPHA-001", "alpha-grant"],
    ["ALPHA-001/print", "alpha-grant"],
    ["BETA-002", "beta-grant"],
    ["BETA-002/print", "beta-grant"],
  ])("should include the agreement grant code for %s", (path, grantCode) => {
    const mockRequest = {
      auth: { credentials: {} },
      headers: {},
      app: { cspNonce: "test-nonce" },
      info: { id: "test-id" },
      yar: {
        get: vi.fn(() => [
          { agreementRef: "ALPHA-001", grantCode: "alpha-grant" },
          { agreementRef: "BETA-002", grantCode: "beta-grant" },
        ]),
      },
    };

    proxyUseCase.proxyToAgreements(path, mockRequest);

    expect(generateAgreementsJwt).toHaveBeenCalledWith(undefined, grantCode);
  });

  test("should preserve legacy JWT claims without an agreement grant context", () => {
    const mockRequest = {
      auth: { credentials: {} },
      headers: {},
      app: { cspNonce: "test-nonce" },
      info: { id: "test-id" },
    };

    proxyUseCase.proxyToAgreements("LEGACY-001/print", mockRequest);

    expect(generateAgreementsJwt).toHaveBeenCalledWith(undefined, undefined);
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
    expect(generateAgreementsJwt).toHaveBeenCalledWith(undefined, undefined);
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

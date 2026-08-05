import { beforeEach, describe, expect, test, vi } from "vitest";
import { generateAgreementsJwt } from "../../common/helpers/agreements-jwt.js";
import { findCaseByIdUseCase } from "./find-case-by-id.use-case.js";
import * as proxyUseCase from "./proxy-to-agreements.use-case.js";

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

vi.mock("../../common/helpers/agreements-jwt.js", () => ({
  generateAgreementsJwt: vi.fn(() => "mock-jwt-token"),
}));

vi.mock("../../common/logger.js", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("./find-case-by-id.use-case.js", () => ({
  findCaseByIdUseCase: vi.fn(),
}));

const createRequest = (credentials = {}) => ({
  auth: { credentials },
  headers: {},
  app: { cspNonce: "test-nonce" },
  info: { id: "test-id" },
});

describe("proxyToAgreements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return uri and headers with JWT when SBI exists", () => {
    const request = createRequest({ sbi: "123456789" });
    request.headers["content-type"] = "application/json";

    const result = proxyUseCase.proxyToAgreements({
      path: "test-path",
      request,
    });

    expect(result.uri).toBe("http://localhost:3000/test-path");
    expect(result.headers.Authorization).toBe("Bearer test-token");
    expect(result.headers["x-base-url"]).toBe("/agreement");
    expect(result.headers["x-csp-nonce"]).toBe("test-nonce");
    expect(result.headers["x-encrypted-auth"]).toBe("mock-jwt-token");
    expect(generateAgreementsJwt).toHaveBeenCalledWith("123456789", undefined);
  });

  test("should return uri and headers with JWT even when no SBI", () => {
    const result = proxyUseCase.proxyToAgreements({
      path: "test-path",
      request: createRequest(),
    });

    expect(result.uri).toBe("http://localhost:3000/test-path");
    expect(result.headers["x-encrypted-auth"]).toBe("mock-jwt-token");
    expect(generateAgreementsJwt).toHaveBeenCalledWith(undefined, undefined);
  });

  test("should handle paths with leading slash", () => {
    const result = proxyUseCase.proxyToAgreements({
      path: "/test-path",
      request: createRequest(),
    });

    expect(result.uri).toBe("http://localhost:3000/test-path");
  });

  test("should use default content-type when not provided", () => {
    const result = proxyUseCase.proxyToAgreements({
      path: "test",
      request: createRequest(),
    });

    expect(result.headers["content-type"]).toBe("text/html");
  });

  test("should use correlation headers from request when available", () => {
    const request = createRequest();
    request.headers = {
      "x-request-id": "custom-request-id",
      "x-correlation-id": "custom-correlation-id",
    };

    const result = proxyUseCase.proxyToAgreements({ path: "test", request });

    expect(result.headers["X-Request-ID"]).toBe("custom-request-id");
    expect(result.headers["X-Correlation-ID"]).toBe("custom-correlation-id");
  });

  test("should use info.id for correlation when headers are absent", () => {
    const result = proxyUseCase.proxyToAgreements({
      path: "test",
      request: createRequest(),
    });

    expect(result.headers["X-Request-ID"]).toBe("test-id");
    expect(result.headers["X-Correlation-ID"]).toBe("test-id");
  });

  test("should handle an empty path", () => {
    const result = proxyUseCase.proxyToAgreements({
      path: "",
      request: createRequest(),
    });

    expect(result.uri).toBe("http://localhost:3000");
  });
});

describe("proxyCaseAgreement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("uses the trusted case workflow code in the Agreements JWT", async () => {
    findCaseByIdUseCase.mockResolvedValue({
      data: {
        workflowCode: "pigs-might-fly",
        payload: { identifiers: { sbi: "123456789" } },
      },
    });
    const request = createRequest({
      token: "caseworking-token",
      user: { id: "caseworker-1" },
    });

    const result = await proxyUseCase.proxyCaseAgreement(
      "case-123",
      "PMF823153883",
      request,
    );

    expect(findCaseByIdUseCase).toHaveBeenCalledWith(
      {
        token: "caseworking-token",
        user: { id: "caseworker-1" },
      },
      "case-123",
    );
    expect(generateAgreementsJwt).toHaveBeenCalledWith(
      "123456789",
      "pigs-might-fly",
    );
    expect(result.uri).toBe("http://localhost:3000/PMF823153883");
  });

  test("fails when the case workflow code is unavailable", async () => {
    findCaseByIdUseCase.mockResolvedValue({ data: {} });

    await expect(
      proxyUseCase.proxyCaseAgreement(
        "case-123",
        "PMF823153883",
        createRequest({ token: "caseworking-token", user: {} }),
      ),
    ).rejects.toMatchObject({
      message: "Case workflow code is unavailable",
      output: { statusCode: 502 },
    });
  });
});

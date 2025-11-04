import { beforeEach, describe, expect, test, vi } from "vitest";

// Mock the config module
vi.mock("../config.js", () => ({
  config: {
    get: vi.fn((key) => {
      if (key === "agreements.jwtSecret") {
        return "test-jwt-secret";
      }
      return null;
    }),
  },
}));

// Mock the logger module
vi.mock("../logger.js", () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe("generateAgreementsJwt", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should generate JWT token with correct payload", async () => {
    const { generateAgreementsJwt } = await import("./agreements-jwt.js");
    const sbi = "123456789";
    const token = generateAgreementsJwt(sbi);

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);

    // The token should be a valid JWT format (3 parts separated by dots)
    const parts = token.split(".");
    expect(parts).toHaveLength(3);

    // Decode the payload (second part)
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    expect(payload.sbi).toBe("123456789");
    expect(payload.source).toBe("caseworking");
  });

  test("should include SBI and source in payload", async () => {
    const { generateAgreementsJwt } = await import("./agreements-jwt.js");
    const sbi = "987654321";
    const token = generateAgreementsJwt(sbi);

    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    expect(payload.sbi).toBe("987654321");
    expect(payload.source).toBe("caseworking");
  });

  test("should handle numeric SBI", async () => {
    const { generateAgreementsJwt } = await import("./agreements-jwt.js");
    const sbi = 123456789;
    const token = generateAgreementsJwt(sbi);

    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    expect(payload.sbi).toBe("123456789");
  });

  test("should throw error when JWT secret is missing", async () => {
    // Mock config to return null for JWT secret
    const config = await import("../config.js");
    vi.mocked(config.config.get).mockImplementation((key) => {
      if (key === "agreements.jwtSecret") {
        return null;
      }
      return "test-value";
    });

    const { generateAgreementsJwt } = await import("./agreements-jwt.js");

    expect(() => {
      generateAgreementsJwt("123456789");
    }).toThrow("Missing AGREEMENTS_JWT_SECRET configuration");
  });
});

import Jwt from "@hapi/jwt";
import { beforeEach, describe, expect, test, vi } from "vitest";

// Mock the config module
vi.mock("../config.js", () => ({
  config: {
    get: vi.fn((key) => {
      if (key === "agreements.jwtSecret") {
        return "test-jwt-secret";
      }
      if (key === "agreements.jwtKid") {
        return "agreements-hs256-1";
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
    expect(payload.source).toBe("entra");
    expect(payload.grantCode).toBeUndefined();
  });

  test("should include FGP-1307 hardened claims (iss, aud, sub, exp)", async () => {
    const { generateAgreementsJwt } = await import("./agreements-jwt.js");
    const before = Math.floor(Date.now() / 1000);
    const token = generateAgreementsJwt("123456789", "soil-improvement");

    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

    expect(payload.iss).toBe("fg-cw-frontend");
    expect(payload.aud).toEqual(["agreements-ui", "gas"]);
    expect(payload.sub).toBe("123456789");
    expect(payload.exp).toBeGreaterThanOrEqual(before + 300);
    expect(payload.exp).toBeLessThanOrEqual(before + 300 + 5);
  });

  test("should fall back to the issuer as subject when no SBI is present", async () => {
    const { generateAgreementsJwt } = await import("./agreements-jwt.js");
    const token = generateAgreementsJwt(undefined);

    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

    expect(payload.sub).toBe("fg-cw-frontend");
  });

  test("should include configured grant code alongside existing claims", async () => {
    const { generateAgreementsJwt } = await import("./agreements-jwt.js");
    const token = generateAgreementsJwt("123456789", "soil-improvement");

    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    expect(payload).toMatchObject({
      sbi: "123456789",
      source: "entra",
      grantCode: "soil-improvement",
    });
  });

  test("should include SBI and source in payload", async () => {
    const { generateAgreementsJwt } = await import("./agreements-jwt.js");
    const sbi = "987654321";
    const token = generateAgreementsJwt(sbi);

    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    expect(payload.sbi).toBe("987654321");
    expect(payload.source).toBe("entra");
  });

  test("should handle numeric SBI", async () => {
    const { generateAgreementsJwt } = await import("./agreements-jwt.js");
    const sbi = 123456789;
    const token = generateAgreementsJwt(sbi);

    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    expect(payload.sbi).toBe("123456789");
    expect(payload.source).toBe("entra");
  });

  test("should generate JWT without SBI for 'entra' source", async () => {
    const { generateAgreementsJwt } = await import("./agreements-jwt.js");
    const token = generateAgreementsJwt(undefined);

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    expect(payload.source).toBe("entra");
    expect(payload.sbi).toBeUndefined();
    expect(payload.grantCode).toBeUndefined();
  });

  test("should generate JWT with null SBI for 'entra' source", async () => {
    const { generateAgreementsJwt } = await import("./agreements-jwt.js");
    const token = generateAgreementsJwt(null);

    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    expect(payload.source).toBe("entra");
    expect(payload.sbi).toBeUndefined();
    expect(payload.grantCode).toBeUndefined();
  });

  test("should stamp the configured kid in the JWT header", async () => {
    const { generateAgreementsJwt } = await import("./agreements-jwt.js");
    const token = generateAgreementsJwt("123456789");

    const parts = token.split(".");
    const header = JSON.parse(Buffer.from(parts[0], "base64").toString());
    expect(header.kid).toBe("agreements-hs256-1");
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

  test("should omit the kid header when no kid is configured", async () => {
    const config = await import("../config.js");
    vi.mocked(config.config.get).mockImplementation((key) => {
      if (key === "agreements.jwtSecret") {
        return "test-jwt-secret";
      }
      // jwtKid (and anything else) resolves to null
      return null;
    });

    const { generateAgreementsJwt } = await import("./agreements-jwt.js");
    const token = generateAgreementsJwt("123456789");

    const parts = token.split(".");
    const header = JSON.parse(Buffer.from(parts[0], "base64").toString());
    expect(header.kid).toBeUndefined();
  });

  test("should wrap and rethrow when JWT generation fails", async () => {
    const generateSpy = vi
      .spyOn(Jwt.token, "generate")
      .mockImplementation(() => {
        throw new Error("boom");
      });

    const { logger } = await import("../logger.js");
    const { generateAgreementsJwt } = await import("./agreements-jwt.js");

    expect(() => {
      generateAgreementsJwt("123456789");
    }).toThrow("Failed to generate JWT token: boom");

    expect(logger.error).toHaveBeenCalledWith(
      "Failed to generate agreements JWT",
      { error: "boom" },
    );

    generateSpy.mockRestore();
  });
});

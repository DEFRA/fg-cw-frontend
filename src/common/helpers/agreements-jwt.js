import Jwt from "@hapi/jwt";
import { config } from "../config.js";
import { logger } from "../logger.js";

/**
 * Generates a JWT token for agreements authentication
 * @param {string} sbi - The SBI (Single Business Identifier)
 * @returns {string} The JWT token
 * @throws {Error} If JWT generation fails
 */
export const generateAgreementsJwt = function (sbi) {
  const jwtSecret = config.get("agreements.jwtSecret");

  if (!jwtSecret) {
    throw new Error("Missing AGREEMENTS_JWT_SECRET configuration");
  }

  try {
    const payload = {
      sbi: sbi.toString(),
      source: "caseworking",
    };

    return Jwt.token.generate(payload, jwtSecret);
  } catch (error) {
    logger.error("Failed to generate agreements JWT", { error: error.message });
    throw new Error(`Failed to generate JWT token: ${error.message}`);
  }
};

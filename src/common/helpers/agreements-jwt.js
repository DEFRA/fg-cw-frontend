import Jwt from "@hapi/jwt";
import { config } from "../config.js";
import { logger } from "../logger.js";

/**
 * Generates a JWT token for agreements authentication
 * @param {string|number|undefined} sbi - The SBI (Single Business Identifier), optional for 'entra' source
 * @param {string|undefined} grantCode - The grant code, when the agreement is routed by grant
 * @returns {string} The JWT token
 * @throws {Error} If JWT generation fails
 */
const buildJwtPayload = function (sbi, grantCode) {
  const payload = { source: "entra" };
  if (sbi != null) {
    payload.sbi = sbi.toString();
  }
  if (grantCode) {
    payload.grantCode = grantCode;
  }
  return payload;
};

export const generateAgreementsJwt = function (sbi, grantCode) {
  const jwtSecret = config.get("agreements.jwtSecret");

  if (!jwtSecret) {
    throw new Error("Missing AGREEMENTS_JWT_SECRET configuration");
  }

  try {
    const payload = buildJwtPayload(sbi, grantCode);
    return Jwt.token.generate(payload, jwtSecret);
  } catch (error) {
    logger.error("Failed to generate agreements JWT", { error: error.message });
    throw new Error(`Failed to generate JWT token: ${error.message}`);
  }
};

import Jwt from "@hapi/jwt";
import { config } from "../config.js";
import { logger } from "../logger.js";

// FGP-1307: caller-token hardening. These registered claims are added so that
// Agreements UI and GAS can verify the caller token (issuer, audience, subject
// and a short expiry). They are additive - consumers validate them in a
// backwards-compatible ("warn-only") mode until enforcement lands.
const TOKEN_ISSUER = "fg-cw-frontend";
// Interim: one token is accepted by both Agreements UI and GAS. This will be
// replaced by token exchange (a per-target audience) later.
const TOKEN_AUDIENCE = ["agreements-ui", "gas"];
// Five-minute expiry; a fresh token is minted per authenticated request.
const TOKEN_TTL_SECONDS = 300;

/**
 * Generates a JWT token for agreements authentication
 * @param {string|number|undefined} sbi - The SBI (Single Business Identifier), optional for 'entra' source
 * @param {string|undefined} grantCode - The grant code, when the agreement is routed by grant
 * @returns {string} The JWT token
 * @throws {Error} If JWT generation fails
 */
const buildJwtPayload = function (sbi, grantCode) {
  const payload = {
    source: "entra",
    iss: TOKEN_ISSUER,
    aud: TOKEN_AUDIENCE,
  };
  if (sbi != null) {
    payload.sbi = sbi.toString();
  }
  if (grantCode) {
    payload.grantCode = grantCode;
  }
  payload.sub = payload.sbi ?? TOKEN_ISSUER;
  return payload;
};

export const generateAgreementsJwt = function (sbi, grantCode) {
  const jwtSecret = config.get("agreements.jwtSecret");

  if (!jwtSecret) {
    throw new Error("Missing AGREEMENTS_JWT_SECRET configuration");
  }

  try {
    const payload = buildJwtPayload(sbi, grantCode);
    // FGP-1307: stamp a `kid` in the JWT header so consumers can select the
    // verifying secret from their keyring and support key rotation via overlap.
    const kid = config.get("agreements.jwtKid");
    return Jwt.token.generate(payload, jwtSecret, {
      ttlSec: TOKEN_TTL_SECONDS,
      ...(kid ? { header: { kid } } : {}),
    });
  } catch (error) {
    logger.error("Failed to generate agreements JWT", { error: error.message });
    throw new Error(`Failed to generate JWT token: ${error.message}`);
  }
};

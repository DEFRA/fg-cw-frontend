import { WebIdentityTokenProvider } from "@defra/hapi-auth-oidc";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// oidc.js reads config at module load, so each case needs a fresh import.
const loadOidc = async (env) => {
  vi.resetModules();

  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value);
  }

  const { oidc } = await import("./oidc.js");

  return oidc;
};

const entraDiscoveryUri =
  "https://login.microsoftonline.com/a-tenant/v2.0/.well-known/openid-configuration";

describe("oidc", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("proves its identity to Entra by federation, holding no secret", async () => {
    const oidc = await loadOidc({ OIDC_DISCOVERY_URI: entraDiscoveryUri });

    expect(oidc.options.oidc.authProvider).toBeInstanceOf(
      WebIdentityTokenProvider,
    );
    expect(oidc.options.oidc.authProvider.type).toBe("federated");
  });

  it("asks STS for a token addressed to the federated credential audience", async () => {
    const oidc = await loadOidc({
      OIDC_DISCOVERY_URI: entraDiscoveryUri,
      FEDERATED_CREDENTIALS_AUDIENCE: "fg-cw-frontend",
    });

    // STS takes Audience as a list.
    expect(oidc.options.oidc.authProvider.audience).toEqual(["fg-cw-frontend"]);
  });

  it("takes the callback on a cross-site form post when cookies are secure", async () => {
    const oidc = await loadOidc({
      OIDC_DISCOVERY_URI: entraDiscoveryUri,
      SESSION_COOKIE_SECURE: "true",
    });

    expect(oidc.options.oidc.responseMode).toBe("form_post");
    expect(oidc.options.cookieOptions.isSameSite).toBe("None");
    expect(oidc.options.oidc.useHttp).toBe(false);
  });

  it("falls back to a secret against the local Entra stub, which has no federated credential", async () => {
    const oidc = await loadOidc({
      NODE_ENV: "development",
      OIDC_DISCOVERY_URI:
        "http://localhost:3010/.well-known/openid-configuration",
      SESSION_COOKIE_SECURE: "false",
    });

    expect(oidc.options.oidc.authProvider.type).toBe("client_secret");
    expect(oidc.options.oidc.useHttp).toBe(true);
    // The stub pins its endpoints to localhost, so the leg stays same-site and
    // there is no Secure cookie to pair SameSite=None with.
    expect(oidc.options.oidc.responseMode).toBe("query");
    expect(oidc.options.cookieOptions.isSameSite).toBe("Lax");
  });

  it("keeps the api scope, without which the backend rejects every call", async () => {
    const oidc = await loadOidc({
      OIDC_DISCOVERY_URI: entraDiscoveryUri,
      OIDC_CLIENT_ID: "a-client-id",
    });

    expect(oidc.options.oidc.scope).toBe(
      "openid profile email offline_access api://a-client-id/cw.backend",
    );
  });

  it("buys a refresh token, without which sessions die at the first token expiry", async () => {
    const oidc = await loadOidc({ OIDC_DISCOVERY_URI: entraDiscoveryUri });

    expect(oidc.options.oidc.scope).toContain("offline_access");
  });

  it("pins the redirect uri to the browser-facing host, not the inbound Host header", async () => {
    const oidc = await loadOidc({
      OIDC_DISCOVERY_URI: entraDiscoveryUri,
      APP_BASE_URL: "https://fg-cw-frontend.dev.cdp-int.defra.cloud",
    });

    expect(oidc.options.oidc.externalBaseUrl).toBe(
      "https://fg-cw-frontend.dev.cdp-int.defra.cloud",
    );
    expect(oidc.options.oidc.loginCallbackUri).toBe("/login/callback");
  });
});

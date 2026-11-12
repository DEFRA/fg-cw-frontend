import { MockProvider, WebIdentityTokenProvider } from "@defra/hapi-auth-oidc";
import { afterEach, describe, expect, it, vi } from "vitest";

const discoveryUri =
  "https://login.microsoftonline.com/tenant/v2.0/.well-known";

const loadAuthProvider = async (env) => {
  vi.resetModules();
  vi.stubEnv("OIDC_DISCOVERY_URI", discoveryUri);
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value);
  }
  const { oidc } = await import("./oidc.js");
  return oidc.options.oidc.authProvider;
};

describe("oidc auth provider", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("authenticates with a web identity token when no client secret is set", async () => {
    const provider = await loadAuthProvider({});

    expect(provider).toBeInstanceOf(WebIdentityTokenProvider);
  });

  it("falls back to the client secret when one is configured", async () => {
    const provider = await loadAuthProvider({ OIDC_CLIENT_SECRET: "s3cret" });

    expect(provider).toBeInstanceOf(MockProvider);
  });
});

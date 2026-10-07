import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "src",
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    environment: "jsdom",
    env: {
      NODE_OPTIONS: "--disable-warning=ExperimentalWarning",
      FG_CW_BACKEND: "http://localhost:3001",
      SESSION_CACHE_ENGINE: "memory",
      REDIS_PASSWORD: "",
      SESSION_COOKIE_PASSWORD:
        "the-password-must-be-at-least-32-characters-long",
      OIDC_DISCOVERY_URI:
        "http://localhost:3010/.well-known/openid-configuration",
      OIDC_CLIENT_ID: "client1",
      APP_BASE_URL: "http://localhost:3100",
      AUTH_COOKIE_PASSWORD: "the-password-must-be-at-least-32-characters-long",
      TZ: "Europe/London",
    },
    coverage: {
      include: ["src"],
      exclude: ["*.scss", "*.test.js", "*.svg", "*.njk"],
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      all: true,
      skipFull: false,
      thresholds: {
        statements: 85,
        branches: 85,
        functions: 85,
        lines: 85,
      },
      reportOnFailure: true,
      ignoreEmptyLines: false,
      perFile: true,
    },
  },
});

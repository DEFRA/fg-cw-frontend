import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "src",
    mockReset: true,
    environment: "jsdom",
    env: {
      NODE_OPTIONS: "--disable-warning=ExperimentalWarning",
      FG_CW_BACKEND: "http://localhost:3001",
      SESSION_CACHE_ENGINE: "memory",
      REDIS_PASSWORD: "",
      SESSION_COOKIE_PASSWORD:
        "the-password-must-be-at-least-32-characters-long",
      OIDC_AUTH_ENDPOINT: "http://localhost:3010/auth",
      OIDC_TOKEN_ENDPOINT: "http://localhost:3010/token",
      OIDC_CLIENT_ID: "client1",
      OIDC_CLIENT_SECRET: "secret1",
      TZ: "Europe/London",
    },
    coverage: {
      include: ["src"],
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

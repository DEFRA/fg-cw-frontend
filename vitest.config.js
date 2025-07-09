import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "src",
    mockReset: true,
    environment: "jsdom",
    env: {
      NODE_OPTIONS: "--disable-warning=ExperimentalWarning",
      FG_CW_BACKEND: "http://localhost:3001",
      REDIS_PASSWORD: "",
      SESSION_COOKIE_PASSWORD:
        "the-password-must-be-at-least-32-characters-long",
      AZURE_CLIENT_ID: "client-id",
      AZURE_TENANT_ID: "tenant-id",
      AZURE_CLIENT_SECRET: "secret-id",
    },
    coverage: {
      enabled: true,
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

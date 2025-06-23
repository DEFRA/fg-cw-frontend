import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    dir: "src",
    mockReset: true,
    environment: "jsdom",
    env: {
      NODE_OPTIONS: "--disable-warning=ExperimentalWarning",
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

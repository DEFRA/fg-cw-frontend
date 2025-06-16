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
        statements: 40,
        branches: 40,
        functions: 40,
        lines: 40,
      },
      reportOnFailure: true,
      ignoreEmptyLines: false,
      perFile: true,
    },
  },
});

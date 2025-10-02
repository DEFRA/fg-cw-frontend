import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { logger } from "../../logger.js";
import { buildNavigation } from "./build-navigation.js";

vi.mock("node:fs");

vi.mock("../../config.js", () => ({
  config: {
    get: (key) =>
      ({
        assetPath: "/public",
        root: "/app",
        serviceName: "Test Service",
        "log.redact": ["password", "secret"],
        "log.level": "info",
      })[key],
  },
}));

vi.mock("../../logger.js", () => ({
  logger: {
    error: vi.fn(),
  },
}));
vi.mock("./build-navigation.js");

describe("context", () => {
  beforeEach(() => {
    vi.resetModules();

    buildNavigation.mockReturnValue([
      { text: "Home", url: "/", isActive: true },
    ]);
  });

  describe("when webpack manifest exists", () => {
    beforeEach(() => {
      readFileSync.mockReturnValue(
        JSON.stringify({
          "app.js": "js/app-123.js",
          "style.css": "css/style-123.css",
        }),
      );
    });

    test("should return correct context object", async () => {
      const { context } = await import("./context.js");
      const result = context({ path: "/" });

      expect(result).toEqual({
        assetPath: "/public/assets",
        serviceName: "Test Service",
        serviceUrl: "/",
        breadcrumbs: [],
        navigation: [{ text: "Home", url: "/", isActive: true }],
        getAssetPath: expect.any(Function),
      });
    });

    test("should return correct asset path for known assets", async () => {
      const { context } = await import("./context.js");
      const result = context({ path: "/" });

      expect(result.getAssetPath("app.js")).toBe("/public/js/app-123.js");
      expect(result.getAssetPath("style.css")).toBe(
        "/public/css/style-123.css",
      );
    });

    test("should return fallback path for unknown assets", async () => {
      const { context } = await import("./context.js");
      const result = context({ path: "/" });

      expect(result.getAssetPath("unknown.png")).toBe("/public/unknown.png");
    });

    test("should cache manifest after first read", async () => {
      const { context } = await import("./context.js");

      context({ path: "/" });
      expect(readFileSync).toHaveBeenCalledTimes(1);

      context({ path: "/" });
      expect(readFileSync).toHaveBeenCalledTimes(1); // Still 1, not 2
    });
  });

  describe("when webpack manifest read fails", () => {
    beforeEach(() => {
      readFileSync.mockImplementation(() => {
        throw new Error("File not found");
      });
    });

    test("should log error and continue", async () => {
      const { context } = await import("./context.js");
      const result = context({ path: "/" });

      expect(logger.error).toHaveBeenCalledWith(
        "Webpack assets-manifest.json not found",
      );
      expect(result.getAssetPath("app.js")).toBe("/public/app.js");
    });

    test("should provide working context even when manifest is missing", async () => {
      const { context } = await import("./context.js");
      const result = context({ path: "/" });

      expect(result).toEqual({
        assetPath: "/public/assets",
        serviceName: "Test Service",
        serviceUrl: "/",
        breadcrumbs: [],
        navigation: [{ text: "Home", url: "/", isActive: true }],
        getAssetPath: expect.any(Function),
      });
    });
  });

  describe("with null request", () => {
    test("should handle null request gracefully", async () => {
      const { context } = await import("./context.js");
      const result = context(null);

      expect(result).toEqual({
        assetPath: "/public/assets",
        serviceName: "Test Service",
        serviceUrl: "/",
        breadcrumbs: [],
        navigation: [{ text: "Home", url: "/", isActive: true }],
        getAssetPath: expect.any(Function),
      });
    });
  });
});

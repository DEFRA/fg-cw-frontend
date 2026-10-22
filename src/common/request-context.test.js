import hapi from "@hapi/hapi";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { config } from "./config.js";
import { logger } from "./logger.js";
import {
  getClientIp,
  getRequestContext,
  readClientIp,
  requestContext,
} from "./request-context.js";

vi.mock("./logger.js", () => ({
  logger: { info: vi.fn() },
}));

const setCdpEnvironment = (value) => {
  const realGet = config.get.bind(config);
  vi.spyOn(config, "get").mockImplementation((key) =>
    key === "cdpEnvironment" ? value : realGet(key),
  );
};

const requestWith = (forwardedFor, remoteAddress = "10.0.0.1") => ({
  headers:
    forwardedFor === undefined ? {} : { "x-forwarded-for": forwardedFor },
  info: { remoteAddress },
});

describe("requestContext", () => {
  let server;

  beforeEach(async () => {
    server = hapi.server();
    await server.register(requestContext);
    server.route({
      method: "GET",
      path: "/ip",
      handler: async () => {
        await new Promise((resolve) => setImmediate(resolve));
        return { clientIp: getClientIp() ?? null };
      },
    });
    await server.initialize();
  });

  afterEach(async () => {
    await server.stop();
    vi.restoreAllMocks();
    logger.info.mockClear();
  });

  it("returns null when no request context is active", () => {
    expect(getRequestContext()).toBeNull();
    expect(getClientIp()).toBeUndefined();
  });

  it("makes the client ip the trusted proxy appended available through the request", async () => {
    const { result } = await server.inject({
      method: "GET",
      url: "/ip",
      headers: { "x-forwarded-for": "6.6.6.6, 203.0.113.7" },
    });

    expect(result).toEqual({ clientIp: "203.0.113.7" });
  });

  it("falls back to the connection address without x-forwarded-for", async () => {
    const { result } = await server.inject({
      method: "GET",
      url: "/ip",
      remoteAddress: "198.51.100.4",
    });

    expect(result).toEqual({ clientIp: "198.51.100.4" });
  });

  it("logs the raw forwarding facts in dev only", async () => {
    setCdpEnvironment("dev");

    await server.inject({
      method: "GET",
      url: "/ip",
      headers: { "x-forwarded-for": "6.6.6.6, 203.0.113.7" },
      remoteAddress: "10.0.0.1",
    });

    expect(logger.info).toHaveBeenCalledWith(
      {
        xForwardedFor: "6.6.6.6, 203.0.113.7",
        remoteAddress: "10.0.0.1",
        path: "/ip",
      },
      "FGP-1520 client ip debug",
    );
  });

  it("logs a null header in dev when nothing was forwarded", async () => {
    setCdpEnvironment("dev");

    await server.inject({
      method: "GET",
      url: "/ip",
      remoteAddress: "198.51.100.4",
    });

    expect(logger.info).toHaveBeenCalledWith(
      { xForwardedFor: null, remoteAddress: "198.51.100.4", path: "/ip" },
      "FGP-1520 client ip debug",
    );
  });

  it("does not log the raw forwarding facts outside dev", async () => {
    setCdpEnvironment("test");

    await server.inject({
      method: "GET",
      url: "/ip",
      headers: { "x-forwarded-for": "6.6.6.6, 203.0.113.7" },
    });

    expect(logger.info).not.toHaveBeenCalled();
  });
});

describe("readClientIp", () => {
  it("answers the connection address when nothing was forwarded", () => {
    expect(readClientIp(requestWith(undefined, "198.51.100.4"), 1)).toBe(
      "198.51.100.4",
    );
  });

  it("ignores entries a browser sent ahead of the trusted proxy", () => {
    expect(readClientIp(requestWith("6.6.6.6, 203.0.113.7"), 1)).toBe(
      "203.0.113.7",
    );
  });

  it("counts back one entry per trusted proxy", () => {
    expect(readClientIp(requestWith("6.6.6.6, 203.0.113.7, 10.0.0.2"), 2)).toBe(
      "203.0.113.7",
    );
  });

  it("answers the furthest entry when the chain is shorter than the trusted proxy count", () => {
    expect(readClientIp(requestWith("203.0.113.7"), 3)).toBe("203.0.113.7");
  });

  it("trusts nothing forwarded when no proxies are trusted", () => {
    expect(readClientIp(requestWith("203.0.113.7", "198.51.100.4"), 0)).toBe(
      "198.51.100.4",
    );
  });

  it("passes IPv6 through unchanged", () => {
    expect(readClientIp(requestWith("2001:db8::1"), 1)).toBe("2001:db8::1");
  });
});

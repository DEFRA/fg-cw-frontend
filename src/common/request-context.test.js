import hapi from "@hapi/hapi";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getClientIp,
  getRequestContext,
  requestContext,
} from "./request-context.js";

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
  });

  it("returns null when no request context is active", () => {
    expect(getRequestContext()).toBeNull();
    expect(getClientIp()).toBeUndefined();
  });

  it("makes the first x-forwarded-for entry available through the request", async () => {
    const { result } = await server.inject({
      method: "GET",
      url: "/ip",
      headers: { "x-forwarded-for": " 203.0.113.7 , 10.0.0.2" },
    });

    expect(result).toEqual({ clientIp: "203.0.113.7" });
  });

  it("falls back to the remote address without x-forwarded-for", async () => {
    const { result } = await server.inject({
      method: "GET",
      url: "/ip",
      remoteAddress: "198.51.100.4",
    });

    expect(result).toEqual({ clientIp: "198.51.100.4" });
  });
});

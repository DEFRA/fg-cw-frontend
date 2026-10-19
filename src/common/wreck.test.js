import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@defra/hapi-tracing", () => ({
  getTraceId: vi.fn(),
}));

vi.mock("./request-context.js", () => ({
  getClientIp: vi.fn(),
}));

describe("wreck", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("adds trace header when trace id present", async () => {
    const { getTraceId } = await import("@defra/hapi-tracing");
    getTraceId.mockReturnValue("trace-123");

    const { wreck } = await import("./wreck.js");

    const uri = {
      headers: {},
    };

    wreck.events.emit("preRequest", uri);

    expect(uri.headers["x-cdp-request-id"]).toEqual("trace-123");
  });

  it("does not add trace header when trace id absent", async () => {
    const { getTraceId } = await import("@defra/hapi-tracing");
    getTraceId.mockReturnValue(undefined);

    const { wreck } = await import("./wreck.js");

    const uri = {
      headers: {},
    };

    wreck.events.emit("preRequest", uri);

    expect(uri.headers["x-cdp-request-id"]).toBeUndefined();
  });

  it("forwards the originating client ip to the backend", async () => {
    const { getClientIp } = await import("./request-context.js");
    getClientIp.mockReturnValue("203.0.113.7");

    const { wreck } = await import("./wreck.js");

    const uri = {
      headers: {},
    };

    wreck.events.emit("preRequest", uri);

    expect(uri.headers["x-forwarded-for"]).toEqual("203.0.113.7");
  });

  it("does not add x-forwarded-for outside a request", async () => {
    const { getClientIp } = await import("./request-context.js");
    getClientIp.mockReturnValue(undefined);

    const { wreck } = await import("./wreck.js");

    const uri = {
      headers: {},
    };

    wreck.events.emit("preRequest", uri);

    expect(uri.headers).not.toHaveProperty("x-forwarded-for");
  });
});

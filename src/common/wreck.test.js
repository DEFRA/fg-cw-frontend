import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@defra/hapi-tracing", () => ({
  getTraceId: vi.fn(),
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
});

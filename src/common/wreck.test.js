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

  // Overwriting x-forwarded-for with the browser's address got backend
  // calls rejected with 403 before they reached fg-cw-backend on CDP.
  it("does not add x-forwarded-for", async () => {
    const { wreck } = await import("./wreck.js");

    const uri = {
      headers: {},
    };

    wreck.events.emit("preRequest", uri);

    expect(uri.headers).not.toHaveProperty("x-forwarded-for");
  });
});

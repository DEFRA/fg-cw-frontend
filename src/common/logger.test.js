import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@defra/hapi-tracing", () => ({
  getTraceId: vi.fn(),
}));

vi.mock("pino", () => ({
  pino: vi.fn(),
}));

describe("logger", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("adds trace.id mixin when trace id present", async () => {
    const { getTraceId } = await import("@defra/hapi-tracing");
    getTraceId.mockReturnValue("trace-abc");

    const { pino } = await import("pino");

    await import("./logger.js");

    expect(pino).toHaveBeenCalledTimes(1);

    const [options] = pino.mock.calls[0];

    expect(options.mixin()).toEqual({
      "trace.id": "trace-abc",
    });
  });

  it("returns empty mixin when trace id absent", async () => {
    const { getTraceId } = await import("@defra/hapi-tracing");
    getTraceId.mockReturnValue(undefined);

    const { pino } = await import("pino");

    await import("./logger.js");

    expect(pino).toHaveBeenCalledTimes(1);

    const [options] = pino.mock.calls[0];

    expect(options.mixin()).toEqual({});
  });
});

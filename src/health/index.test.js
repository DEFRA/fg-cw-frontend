import { describe, expect, it, vi } from "vitest";
import { health } from "./index.js";
import { getHealthRoute } from "./routes/get-health.route.js";

vi.mock("./routes/get-health.route.js", () => ({
  getHealthRoute: { method: "GET", path: "/health" },
}));

describe("health plugin", () => {
  it("should export a plugin with correct name", () => {
    expect(health.plugin.name).toBe("health");
  });

  it("should have a register function", () => {
    expect(typeof health.plugin.register).toBe("function");
  });

  it("should register the health route when plugin is registered", () => {
    const mockServer = {
      route: vi.fn(),
    };

    health.plugin.register(mockServer);

    expect(mockServer.route).toHaveBeenCalledWith(getHealthRoute);
    expect(mockServer.route).toHaveBeenCalledTimes(1);
  });
});

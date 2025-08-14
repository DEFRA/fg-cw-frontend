import { Cluster, Redis } from "ioredis";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { config } from "./config.js";
import { logger } from "./logger.js";

vi.mock("ioredis");
vi.mock("./config.js");
vi.mock("./logger.js", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("redis-client", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates a Redis client with the correct config", async () => {
    config.get.mockImplementation((key) => {
      const values = {
        "redis.port": 6379,
        "redis.host": "127.0.0.1",
        "redis.keyPrefix": "test:",
        "redis.useTLS": false,
        "redis.username": "",
        "redis.password": null,
        "redis.useSingleInstanceCache": true,
      };
      return values[key];
    });

    const { redisClient } = await import("./redis-client.js");

    expect(redisClient).toBeInstanceOf(Redis);

    expect(Redis).toHaveBeenCalledWith({
      port: 6379,
      host: "127.0.0.1",
      keyPrefix: config.get("redis.keyPrefix"),
      db: 0,
    });
  });

  it("creates a Cluster client with the correct config", async () => {
    config.get.mockImplementation((key) => {
      const values = {
        "redis.port": 6379,
        "redis.host": "127.0.0.1",
        "redis.keyPrefix": "test:",
        "redis.useTLS": true,
        "redis.username": "testuser",
        "redis.password": "testpassword",
        "redis.useSingleInstanceCache": false,
      };
      return values[key];
    });

    const { redisClient } = await import("./redis-client.js");

    expect(redisClient).toBeInstanceOf(Cluster);

    expect(Cluster).toHaveBeenCalledWith(
      [
        {
          port: 6379,
          host: "127.0.0.1",
        },
      ],
      {
        keyPrefix: "test:",
        slotsRefreshTimeout: 10000,
        dnsLookup: expect.any(Function),
        redisOptions: {
          db: 0,
          tls: {},
          credentials: {
            username: "testuser",
            password: "testpassword",
          },
        },
      },
    );
  });

  it("logs connection events", async () => {
    const { redisClient } = await import("./redis-client.js");

    const [, onConnect] = redisClient.on.mock.calls.find(
      ([event]) => event === "connect",
    );

    onConnect();

    expect(logger.info).toHaveBeenCalledWith("Connected to Redis");
  });

  it("logs errors", async () => {
    const { redisClient } = await import("./redis-client.js");

    const [, onError] = redisClient.on.mock.calls.find(
      ([event]) => event === "error",
    );

    const error = new Error("Connection failed");
    onError(error);

    expect(logger.error).toHaveBeenCalledWith(
      `Failed to connect to Redis: ${error}`,
    );
  });
});

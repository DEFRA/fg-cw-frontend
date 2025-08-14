import { Cluster, Redis } from "ioredis";
import { config } from "./config.js";
import { logger } from "./logger.js";

const db = 0;

export const redisClient = config.get("redis.useSingleInstanceCache")
  ? new Redis({
      port: config.get("redis.port"),
      host: config.get("redis.host"),
      keyPrefix: config.get("redis.keyPrefix"),
      db,
    })
  : new Cluster(
      [
        {
          port: config.get("redis.port"),
          host: config.get("redis.host"),
        },
      ],
      {
        keyPrefix: config.get("redis.keyPrefix"),
        slotsRefreshTimeout: 10000,
        dnsLookup(address, callback) {
          callback(null, address);
        },
        redisOptions: {
          db,
          tls: {},
          username: config.get("redis.username"),
          password: config.get("redis.password"),
        },
      },
    );

redisClient.on("error", (error) => {
  logger.error(`Failed to connect to Redis: ${error}`);
});

redisClient.on("connect", () => {
  logger.info("Connected to Redis");
});

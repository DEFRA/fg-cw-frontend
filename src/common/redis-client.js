import { Cluster, Redis } from "ioredis";
import { config } from "./config.js";
import { logger } from "./logger.js";

const redisOptions = {
  db: 0,
};

if (config.get("redis.username")) {
  redisOptions.credentials = {
    username: config.get("redis.username"),
    password: config.get("redis.password"),
  };
}

if (config.get("redis.useTLS")) {
  redisOptions.tls = { tls: {} };
}

export const redisClient = config.get("redis.useSingleInstanceCache")
  ? new Redis({
      port: config.get("redis.port"),
      host: config.get("redis.host"),
      keyPrefix: config.get("redis.keyPrefix"),
      ...redisOptions,
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
        redisOptions,
      },
    );

redisClient.on("connect", () => {
  logger.info("Connected to Redis");
});

redisClient.on("error", (error) => {
  logger.error(`Failed to connect to Redis: ${error}`);
});

import { Engine as CatboxMemory } from "@hapi/catbox-memory";
import { Engine as CatboxRedis } from "@hapi/catbox-redis";
import Yar from "@hapi/yar";
import { config } from "../../common/config.js";
import { redisClient } from "../../common/redis-client.js";

export const session = {
  plugin: {
    name: "session",
    async register(server) {
      const sessionConfig = config.get("session");

      server.cache.provision({
        name: sessionConfig.cache.name,
        engine:
          sessionConfig.cache.engine === "redis"
            ? new CatboxRedis({ client: redisClient })
            : new CatboxMemory(),
      });

      await server.register({
        plugin: Yar,
        options: {
          name: sessionConfig.cache.name,
          cache: {
            cache: sessionConfig.cache.name,
            expiresIn: sessionConfig.cache.ttl,
          },
          maxCookieSize: 0, // store all session data in redis
          storeBlank: false,
          errorOnCacheNotReady: true,
          cookieOptions: {
            password: sessionConfig.cookie.password,
            ttl: sessionConfig.cookie.ttl,
            isSecure: sessionConfig.cookie.secure,
            clearInvalid: true,
            isSameSite: "Strict",
          },
        },
      });
    },
  },
};

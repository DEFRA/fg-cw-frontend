import convict from "convict";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const fourHoursMs = 14400000;
const oneWeekMs = 604800000;

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";
const isDevelopment = process.env.NODE_ENV === "development";

export const config = convict({
  fg_cw_backend_url: {
    doc: "The backend URL for the case worker service",
    format: String,
    default: null,
    env: "FG_CW_BACKEND",
  },
  serviceVersion: {
    doc: "The service version, this variable is injected into your docker container in CDP environments",
    format: String,
    nullable: true,
    default: null,
    env: "SERVICE_VERSION",
  },
  env: {
    doc: "The application environment.",
    format: ["production", "development", "test"],
    default: "development",
    env: "NODE_ENV",
  },
  host: {
    doc: "The host to bind.",
    format: String,
    default: "0.0.0.0",
    env: "HOST",
  },
  port: {
    doc: "The port to bind.",
    format: "port",
    default: 3000,
    env: "PORT",
  },
  staticCacheTimeout: {
    doc: "Static cache timeout in milliseconds",
    format: Number,
    default: oneWeekMs,
    env: "STATIC_CACHE_TIMEOUT",
  },
  serviceName: {
    doc: "Applications Service Name",
    format: String,
    default: "fg-cw-frontend",
  },
  root: {
    doc: "Project root",
    format: String,
    default: path.resolve(dirname, "../.."),
  },
  assetPath: {
    doc: "Asset path",
    format: String,
    default: "/public",
    env: "ASSET_PATH",
  },
  isProduction: {
    doc: "If this application running in the production environment",
    format: Boolean,
    default: isProduction,
  },
  isDevelopment: {
    doc: "If this application running in the development environment",
    format: Boolean,
    default: isDevelopment,
  },
  isTest: {
    doc: "If this application running in the test environment",
    format: Boolean,
    default: isTest,
  },
  log: {
    enabled: {
      doc: "Is logging enabled",
      format: Boolean,
      default: process.env.NODE_ENV !== "test",
      env: "LOG_ENABLED",
    },
    level: {
      doc: "Logging level",
      format: ["fatal", "error", "warn", "info", "debug", "trace", "silent"],
      default: "info",
      env: "LOG_LEVEL",
    },
    format: {
      doc: "Format to output logs in.",
      format: ["ecs", "pino-pretty"],
      default: isProduction ? "ecs" : "pino-pretty",
      env: "LOG_FORMAT",
    },
    redact: {
      doc: "Log paths to redact",
      format: Array,
      default: isProduction
        ? ["req.headers.authorization", "req.headers.cookie", "res.headers"]
        : ["req", "res"],
    },
  },
  isSecureContextEnabled: {
    doc: "Enable Secure Context",
    format: Boolean,
    default: isProduction,
    env: "ENABLE_SECURE_CONTEXT",
  },
  isMetricsEnabled: {
    doc: "Enable metrics reporting",
    format: Boolean,
    default: isProduction,
    env: "ENABLE_METRICS",
  },
  session: {
    cache: {
      engine: {
        doc: "backend cache is written to",
        format: ["redis", "memory"],
        default: isProduction ? "redis" : "memory",
        env: "SESSION_CACHE_ENGINE",
      },
      name: {
        doc: "server side session cache name",
        format: String,
        default: "session",
        env: "SESSION_CACHE_NAME",
      },
      ttl: {
        doc: "server side session cache ttl",
        format: Number,
        default: fourHoursMs,
        env: "SESSION_CACHE_TTL",
      },
    },
    cookie: {
      ttl: {
        doc: "Session cookie ttl",
        format: Number,
        default: fourHoursMs,
        env: "SESSION_COOKIE_TTL",
      },
      password: {
        doc: "session cookie password",
        format: String,
        default: null,
        env: "SESSION_COOKIE_PASSWORD",
        sensitive: true,
      },
      secure: {
        doc: "set secure flag on cookie",
        format: Boolean,
        default: isProduction,
        env: "SESSION_COOKIE_SECURE",
      },
    },
  },
  httpProxy: {
    doc: "Proxy settings",
    format: String,
    default: "",
    env: "HTTP_PROXY",
  },
  redis: /** @type {Schema<RedisConfig>} */ ({
    host: {
      doc: "Redis cache host",
      format: String,
      default: "127.0.0.1",
      env: "REDIS_HOST",
    },
    username: {
      doc: "Redis cache username",
      format: String,
      default: "",
      env: "REDIS_USERNAME",
    },
    password: {
      doc: "Redis cache password",
      format: "*",
      default: null,
      sensitive: true,
      env: "REDIS_PASSWORD",
    },
    keyPrefix: {
      doc: "Redis cache key prefix name used to isolate the cached results across multiple clients",
      format: String,
      default: "fg-cw-frontend:",
      env: "REDIS_KEY_PREFIX",
    },
    useSingleInstanceCache: {
      doc: "Connect to a single instance of redis instead of a cluster.",
      format: Boolean,
      default: !isProduction,
      env: "USE_SINGLE_INSTANCE_CACHE",
    },
    useTLS: {
      doc: "Connect to redis using TLS",
      format: Boolean,
      default: isProduction,
      env: "REDIS_TLS",
    },
  }),
  nunjucks: {
    watch: {
      doc: "Reload templates when they are changed.",
      format: Boolean,
      default: isDevelopment,
    },
    noCache: {
      doc: "Use a cache and recompile templates each time",
      format: Boolean,
      default: isDevelopment,
    },
  },
  tracing: {
    header: {
      doc: "Which header to track",
      format: String,
      default: "x-cdp-request-id",
      env: "TRACING_HEADER",
    },
  },
  auth: {
    msEntraId: {
      tenantId: {
        doc: "The tenant ID for Microsoft Entra ID",
        format: String,
        default: null,
        env: "AZURE_TENANT_ID",
      },
      clientId: {
        doc: "The client ID for Microsoft Entra ID",
        format: String,
        default: null,
        env: "AZURE_CLIENT_ID",
      },
      clientSecret: {
        doc: "The client secret for Microsoft Entra ID",
        format: String,
        default: null,
        sensitive: true,
        env: "AZURE_CLIENT_SECRET",
      },
    },
  },
});

config.validate({ allowed: "strict" });

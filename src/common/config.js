import path from "node:path";
import { fileURLToPath } from "node:url";
import convict from "convict";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const fourHoursMs = 14400000;
const oneWeekMs = 604800000;

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";
const isDevelopment = process.env.NODE_ENV === "development";

export const config = convict({
  backendUrl: {
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
    port: {
      doc: "Redis cache port",
      format: "port",
      default: 6379,
      env: "REDIS_PORT",
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
  oidc: {
    discoveryUri: {
      doc: "OIDC discovery document of the identity provider. Defaults to the shared Entra stub that fg-cw-backend runs on port 3010. Deployed environments point this at Entra ID, as https://login.microsoftonline.com/<tenant-id>/v2.0/.well-known/openid-configuration",
      format: String,
      default: "http://localhost:3010/.well-known/openid-configuration",
      env: "OIDC_DISCOVERY_URI",
    },
    clientId: {
      doc: "Application (client) id, as registered with the identity provider",
      format: String,
      default: "client1",
      env: "OIDC_CLIENT_ID",
    },
    appBaseUrl: {
      doc: "Externally reachable base url of this app, used to build the OIDC redirect uri. Must match a redirect uri registered on the app registration exactly.",
      format: String,
      default: "http://localhost:3100",
      env: "APP_BASE_URL",
    },
    cookie: {
      password: {
        doc: "Password used to encrypt the transient OIDC login and redirect cookies",
        format: String,
        default: "the-password-must-be-at-least-32-characters-long",
        env: "AUTH_COOKIE_PASSWORD",
        sensitive: true,
      },
    },
    federatedCredentials: {
      audience: {
        doc: "Audience configured on the Entra ID federated credential, and requested of AWS STS",
        format: String,
        default: "fg-cw-frontend",
        env: "FEDERATED_CREDENTIALS_AUDIENCE",
      },
    },
  },
  agreements: {
    uiUrl: {
      doc: "Agreements UI URL",
      format: String,
      default: "http://localhost:3000",
      env: "AGREEMENTS_UI_URL",
    },
    uiToken: {
      doc: "Agreements UI token",
      format: String,
      default: "default-agreements-ui-token",
      sensitive: true,
      env: "AGREEMENTS_UI_TOKEN",
    },
    baseUrl: {
      doc: "Agreements base URL",
      format: String,
      default: "/agreement",
      env: "AGREEMENTS_BASE_URL",
    },
    jwtSecret: {
      doc: "JWT Secret for agreements authentication",
      format: String,
      default: "default-agreements-jwt-secret",
      sensitive: true,
      env: "AGREEMENTS_JWT_SECRET",
    },
    jwtKid: {
      doc: "Key id (kid) stamped in the caller JWT header so consumers can select the verifying key during rotation",
      format: String,
      default: "agreements-hs256-1",
      env: "AGREEMENTS_JWT_KID",
    },
    proxyTimeoutMs: {
      doc: "Proxy timeout in milliseconds",
      format: Number,
      default: 30000,
      env: "AGREEMENTS_PROXY_TIMEOUT_MS",
    },
  },
});

config.validate({ allowed: "strict" });

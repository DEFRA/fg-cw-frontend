import { GenericContainer, Wait } from "testcontainers";

export class DevContainers {
  containers = {
    redis: null,
    entra: null,
  };

  async start() {
    console.log("🚀 Starting development containers...\n");

    try {
      const [redisResult, entraResult] = await Promise.all([
        this.#startRedis(),
        this.#startEntra(),
      ]);

      this.containers.redis = redisResult.container;
      this.containers.entra = entraResult.container;

      console.log("\n   All containers ready!\n");

      return {
        ...redisResult.env,
        ...entraResult.env,
      };
    } catch (error) {
      console.error("❌ Failed to start containers:", error.message);
      console.error("\nTry running: npm run dev:clean\n");
      throw error;
    }
  }

  async stop() {
    console.log(
      "\n📦 Containers will remain running for faster subsequent starts",
    );
    console.log("To stop containers, run: npm run containers:stop");
  }

  async #startRedis() {
    console.log("⏳ Starting Redis...");

    const container = await new GenericContainer("redis:7.2.3-alpine3.18")
      .withExposedPorts(6379)
      .withReuse()
      .withLabels({ "testcontainers.reuse.id": "defra-shared-redis" })
      .withWaitStrategy(Wait.forLogMessage(/Ready to accept connections/i))
      .start();

    const host = container.getHost();
    const port = container.getMappedPort(6379);

    console.log(`✓  Redis ready at ${host}:${port}`);

    return {
      container,
      env: {
        REDIS_HOST: host,
        REDIS_PORT: port.toString(),
      },
    };
  }

  async #startEntra() {
    console.log("⏳ Starting Entra OIDC stub...");

    const container = await new GenericContainer(
      "defradigital/fg-entra-stub-frontend:0.11.0",
    )
      .withExposedPorts(3010)
      .withReuse()
      .withLabels({ "testcontainers.reuse.id": "defra-shared-entra" })
      .withWaitStrategy(Wait.forHttp("/jwks", 3010))
      .withStartupTimeout(60000)
      .start();

    const host = container.getHost();
    const port = container.getMappedPort(3010);

    console.log(`✓  Entra stub ready at ${host}:${port}`);

    return {
      container,
      env: {
        OIDC_AUTH_ENDPOINT: `http://${host}:${port}/authorize`,
        OIDC_TOKEN_ENDPOINT: `http://${host}:${port}/token`,
        ENTRA_PORT: port.toString(),
      },
    };
  }
}

import hapi from "@hapi/hapi";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getHealthRoute } from "./get-health.route.js";

describe("getHealthRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(getHealthRoute);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("returns a 200", async () => {
    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/health",
    });

    expect(statusCode).toEqual(200);
    expect(result).toEqual({
      message: "success",
    });
  });
});

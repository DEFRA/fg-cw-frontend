import { Engine as CatboxMemory } from "@hapi/catbox-memory";
import hapi from "@hapi/hapi";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { flashContext } from "../../server/plugins/flash-context.js";
import { session } from "../../server/plugins/session.js";
import { getHealthRoute } from "./get-health.route.js";

vi.mock("../../common/redis-client.js", () => ({ redisClient: {} }));

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

describe("getHealthRoute with session and flash middleware", () => {
  let server;
  let cacheGet;
  let cacheSet;

  beforeAll(async () => {
    server = hapi.server();

    await server.register([session, flashContext]);

    server.route(getHealthRoute);
    server.route({
      method: "GET",
      path: "/create-session",
      options: { auth: false },
      handler(request) {
        request.yar.set("key", "value");
        return null;
      },
    });

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  beforeEach(() => {
    cacheGet = vi.spyOn(CatboxMemory.prototype, "get");
    cacheSet = vi.spyOn(CatboxMemory.prototype, "set");
  });

  describe("without a session cookie", () => {
    it("returns success without touching the session cache or setting a cookie", async () => {
      const responses = await Promise.all(
        Array.from({ length: 10 }, () =>
          server.inject({ method: "GET", url: "/health" }),
        ),
      );

      for (const response of responses) {
        expect(response.statusCode).toEqual(200);
        expect(response.result).toEqual({ message: "success" });
        expect(response.headers["set-cookie"]).toBeUndefined();
      }
      expect(cacheGet).not.toHaveBeenCalled();
      expect(cacheSet).not.toHaveBeenCalled();
    });
  });

  describe("with an existing session cookie", () => {
    it("does not load, modify or refresh the cached session", async () => {
      const setupResponse = await server.inject({
        method: "GET",
        url: "/create-session",
      });
      const [cookie] = setupResponse.headers["set-cookie"][0].split(";");

      cacheGet.mockClear();
      cacheSet.mockClear();

      const response = await server.inject({
        method: "GET",
        url: "/health",
        headers: { cookie },
      });

      expect(response.statusCode).toEqual(200);
      expect(response.result).toEqual({ message: "success" });
      expect(response.headers["set-cookie"]).toBeUndefined();
      expect(cacheGet).not.toHaveBeenCalled();
      expect(cacheSet).not.toHaveBeenCalled();
    });
  });
});

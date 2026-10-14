import { Engine as CatboxMemory } from "@hapi/catbox-memory";
import hapi from "@hapi/hapi";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { setFlashNotification } from "../../common/helpers/flash-helpers.js";
import { flashContext } from "./flash-context.js";
import { session } from "./session.js";

vi.mock("../../common/redis-client.js", () => ({ redisClient: {} }));

describe("session plugin with flash-context", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();

    await server.register([session, flashContext]);

    server.route([
      {
        method: "GET",
        path: "/set-notification",
        handler(request) {
          setFlashNotification(request, {
            variant: "success",
            text: "Saved",
          });
          return null;
        },
      },
      {
        method: "GET",
        path: "/show-notification",
        handler(request) {
          return { notification: request.app.notification ?? null };
        },
      },
    ]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("displays a flash notification once on the next request", async () => {
    const setResponse = await server.inject({
      method: "GET",
      url: "/set-notification",
    });
    const [cookie] = setResponse.headers["set-cookie"][0].split(";");

    const firstRead = await server.inject({
      method: "GET",
      url: "/show-notification",
      headers: { cookie },
    });
    const secondRead = await server.inject({
      method: "GET",
      url: "/show-notification",
      headers: { cookie },
    });

    expect(firstRead.result).toEqual({
      notification: { variant: "success", text: "Saved" },
    });
    expect(secondRead.result).toEqual({ notification: null });
  });

  it.each(["/show-notification", "/unknown-path"])(
    "does not create a session for a cookie-less request to %s",
    async (url) => {
      const cacheSet = vi.spyOn(CatboxMemory.prototype, "set");

      const response = await server.inject({ method: "GET", url });

      expect(response.headers["set-cookie"]).toBeUndefined();
      expect(cacheSet).not.toHaveBeenCalled();
    },
  );
});

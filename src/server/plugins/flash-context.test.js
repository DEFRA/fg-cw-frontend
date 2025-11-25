import hapi from "@hapi/hapi";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { getFlashNotification } from "../../common/helpers/flash-helpers.js";
import { flashContext } from "./flash-context.js";

vi.mock("../../common/helpers/flash-helpers.js");

describe("flash-context plugin", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();

    await server.register(flashContext);

    // Add a test route
    server.route({
      method: "GET",
      path: "/test",
      handler: (request) => ({
        notification: request.app.notification,
      }),
    });

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("should read flash data and store in request.app.notification", async () => {
    getFlashNotification.mockReturnValue({
      variant: "success",
      text: "Test notification",
    });

    const response = await server.inject({
      method: "GET",
      url: "/test",
    });

    expect(getFlashNotification).toHaveBeenCalled();
    expect(response.result.notification).toEqual({
      variant: "success",
      text: "Test notification",
    });
  });

  it("should handle null notification", async () => {
    getFlashNotification.mockReturnValue(null);

    const response = await server.inject({
      method: "GET",
      url: "/test",
    });

    expect(response.result.notification).toBeNull();
  });
});

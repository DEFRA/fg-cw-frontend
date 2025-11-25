import hapi from "@hapi/hapi";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { getFlashData } from "../../common/helpers/flash-helpers.js";
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
    getFlashData.mockReturnValue({
      notification: {
        type: "success",
        message: "Test notification",
      },
    });

    const response = await server.inject({
      method: "GET",
      url: "/test",
    });

    expect(getFlashData).toHaveBeenCalled();
    expect(response.result.notification).toEqual({
      type: "success",
      message: "Test notification",
    });
  });

  it("should handle null notification", async () => {
    getFlashData.mockReturnValue({ notification: null });

    const response = await server.inject({
      method: "GET",
      url: "/test",
    });

    expect(response.result.notification).toBeNull();
  });
});

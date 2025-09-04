import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createServer } from "../../server/index.js";
import { findSecretUseCase } from "../use-cases/find-secret.use-case.js";
import { getSecretRoute } from "./get-secret.route.js";

vi.mock("../use-cases/find-secret.use-case.js");

describe("getSecret", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();
    server.route(getSecretRoute);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("returns 200", async () => {
    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/secret",
      auth: {
        isAuthenticated: true,
        isAuthorized: false,
        isInjected: true,
        credentials: {
          token: "access-token",
          refreshToken: "refresh-token",
          expiresAt: new Date("2050-01-01T00:00:00Z").getTime(),
          user: {
            id: "43e8508b6cbd4ac1b29ee73792ab0f4b",
            name: "Joe Bloggs",
            email: "joe@bloggs.com",
            idpRoles: ["FCP.Casework.Read"],
            appRoles: ["ROLE_SING_AND_DANCE"],
          },
        },
        strategy: "session",
        mode: "required",
        error: null,
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $("#main-content").html();

    expect(findSecretUseCase).toHaveBeenCalledWith("access-token");

    expect(view).toMatchSnapshot();
  });
});

import Bell from "@hapi/bell";
import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { jwtDecode } from "jwt-decode";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { auth } from "../../common/auth.js";
import { nunjucks } from "../../common/nunjucks/nunjucks.js";
import { getSecretRoute } from "./get-secret.route.js";

vi.mock("jwt-decode");

describe("getSecret", () => {
  let server;

  beforeAll(async () => {
    Bell.simulate(() => {
      return {
        provider: "msEntraId",
        query: {},
        artifacts: {},
        credentials: {},
      };
    });
    server = hapi.server();
    await server.register([nunjucks, auth.plugin]);
    server.route(getSecretRoute);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
    Bell.simulate(false);
  });

  it("returns 200", async () => {
    jwtDecode.mockReturnValueOnce({
      roles: ["FCP.Casework.Read"],
    });

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/secret",
      auth: {
        isAuthenticated: true,
        isAuthorized: false,
        isInjected: true,
        credentials: {
          profile: {
            id: "43e8508b-6cbd-4ac1-b29e-e73792ab0f4b",
            displayName: "Julian Kimmings (esynergy)",
            email: "julian.kimmings@Defra.onmicrosoft.com",
          },
          authenticated: true,
          authorised: true,
        },
        artifacts: {
          profile: {
            id: "43e8508b-6cbd-4ac1-b29e-e73792ab0f4b",
            displayName: "Julian Kimmings (esynergy)",
            email: "julian.kimmings@Defra.onmicrosoft.com",
          },
          authenticated: true,
          authorised: true,
        },
        strategy: "session",
        mode: "required",
        error: null,
      },
    });

    expect(statusCode).toEqual(200);
    const $ = load(result);
    const view = $("#main-content").html();
    expect(view).toMatchSnapshot();
  });
});

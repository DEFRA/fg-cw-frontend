import Bell from "@hapi/bell";
import hapi from "@hapi/hapi";
import { jwtDecode } from "jwt-decode";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { auth } from "../../common/auth.js";
import { nunjucks } from "../../common/nunjucks/nunjucks.js";
import { loginCallbackRoute, validateRoles } from "./login-callback.route.js";

vi.mock("jwt-decode");

describe("loginCallbackRoute", () => {
  describe("validateRoles", () => {
    it("should validate that a user role exists in case working roles", () => {
      const userRoles = ["FCP.Casework.Read"];
      expect(validateRoles(userRoles)).toBeTruthy();
    });

    it("should validate multiple roles", () => {
      expect(validateRoles(["Some.Role", "FCP.Casework.Read"])).toBeTruthy();
    });

    it("should validate multiple roles", () => {
      expect(
        validateRoles(["FCP.Casework.Admin", "FCP.Casework.Read"]),
      ).toBeTruthy();
    });

    it("should return false if role doesn't exist", () => {
      expect(validateRoles(["Some.Role"])).toBeFalsy();
    });

    it("should return false if no roles are passed", () => {
      expect(validateRoles()).toBeFalsy();
    });
  });

  describe("route", () => {
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
      server.route(loginCallbackRoute);
      await server.initialize();
    });

    afterAll(async () => {
      await server.stop();
      Bell.simulate(false);
    });

    it("returns 302 redirect", async () => {
      jwtDecode.mockReturnValue({
        roles: ["FCP.Casework.Read"],
      });

      const { statusCode } = await server.inject({
        method: "GET",
        url: "/login/callback",
        auth: {
          isAuthenticated: true,
          isAuthorized: false,
          isInjected: true,
          credentials: {
            profile: {
              id: "43e8508b-6cbd-4ac1-b29e-e73792ab0f4b",
              displayName: "Joe Bloggs",
              email: "joe.bloggs@defra.gov",
            },
            authenticated: true,
            authorised: true,
          },
          artifacts: {
            profile: {
              id: "43e8508b-6cbd-4ac1-b29e-e73792ab0f4b",
              displayName: "Joe Bloggs",
              email: "joe.bloggs@defra.gov",
            },
            id_token: "OIUY&*&*(  ",
            authenticated: true,
            authorised: true,
          },
          strategy: "session",
          mode: "required",
          error: null,
        },
      });

      expect(statusCode).toEqual(302);
    });
  });
});

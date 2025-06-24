import Bell from "@hapi/bell";
import hapi from "@hapi/hapi";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { auth, validateSession } from "./auth.js";

describe("auth", () => {
  describe("auth methods", () => {
    it("should validate session", () => {
      const session = {
        profile: {
          displayName: "Joseph Bloggs",
        },
      };
      expect(validateSession({}, session)).toEqual({
        isValid: true,
        credentials: session,
      });
    });

    it("should return invalid if no session", () => {
      expect(validateSession({}, null)).toEqual({
        isValid: false,
      });
    });

    it("should return invalid if no session.profile", () => {
      const session = {};
      expect(validateSession({}, session)).toEqual({
        isValid: false,
      });
    });
  });

  describe("/logout", () => {
    let server;
    beforeAll(async () => {
      server = hapi.server();
      await server.register([auth.plugin]);
      await server.initialize();
    });

    afterAll(async () => {
      await server.stop();
    });

    it("registers the logout route and returns a 302", async () => {
      const { statusCode } = await server.inject({
        method: "GET",
        url: "/logout",
      });
      expect(statusCode).toEqual(302);
    });
  });

  describe("plugin", () => {
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
      await server.register([auth.plugin]);

      await server.initialize();
    });

    afterAll(async () => {
      await server.stop();
      Bell.simulate(false);
    });

    it("sets up cookie states", async () => {
      expect(server.states.names).toEqual(["session-auth", "bell-azure"]);
    });
  });
});

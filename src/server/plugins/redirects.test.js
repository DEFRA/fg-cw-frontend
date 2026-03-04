import hapi from "@hapi/hapi";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { redirects } from "./redirects.js";

describe("redirects plugin", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();

    server.auth.scheme("mock", () => ({
      authenticate: (request, h) => {
        return h.authenticated({
          credentials: request.headers["x-credentials"],
        });
      },
    }));
    server.auth.strategy("session", "mock");
    server.auth.default("session");

    await server.register(redirects);
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  const injectWithRoles = (idpRoles) => {
    return server.inject({
      method: "GET",
      url: "/",
      headers: {
        "x-credentials": {
          user: { idpRoles },
        },
      },
    });
  };

  describe("user with only FCP.Casework.Admin role", () => {
    it("should redirect to /admin", async () => {
      const response = await injectWithRoles(["FCP.Casework.Admin"]);

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe("/admin");
    });
  });

  describe("user with FCP.Casework.ReadWrite role", () => {
    it("should redirect to /cases", async () => {
      const response = await injectWithRoles(["FCP.Casework.ReadWrite"]);

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe("/cases");
    });
  });

  describe("user with FCP.Casework.Read role", () => {
    it("should redirect to /cases", async () => {
      const response = await injectWithRoles(["FCP.Casework.Read"]);

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe("/cases");
    });
  });

  describe("user with FCP.Casework.Admin AND FCP.Casework.ReadWrite roles", () => {
    it("should redirect to /cases (ReadWrite takes precedence)", async () => {
      const response = await injectWithRoles([
        "FCP.Casework.Admin",
        "FCP.Casework.ReadWrite",
      ]);

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe("/cases");
    });
  });

  describe("user with FCP.Casework.Admin AND FCP.Casework.Read roles", () => {
    it("should redirect to /cases (Read takes precedence)", async () => {
      const response = await injectWithRoles([
        "FCP.Casework.Admin",
        "FCP.Casework.Read",
      ]);

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe("/cases");
    });
  });

  describe("user with all three roles", () => {
    it("should redirect to /cases (ReadWrite/Read take precedence)", async () => {
      const response = await injectWithRoles([
        "FCP.Casework.Admin",
        "FCP.Casework.ReadWrite",
        "FCP.Casework.Read",
      ]);

      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe("/cases");
    });
  });
});

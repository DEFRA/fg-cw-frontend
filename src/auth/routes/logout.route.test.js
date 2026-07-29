import Bell from "@hapi/bell";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { createServer } from "../../server/index.js";
import { logoutUserUseCase } from "../use-cases/logout-user.use-case.js";
import { logoutRoute } from "./logout.route.js";

vi.mock("../use-cases/logout-user.use-case.js", () => ({
  logoutUserUseCase: vi.fn(),
}));

const SEEDED_CREDENTIALS = {
  token: "mock-token",
  user: { id: "69691417bd385df3ac6aa25f", idpRoles: ["ReadWrite"] },
};

describe("logoutRoute", () => {
  let server;

  beforeAll(async () => {
    Bell.simulate(async () => ({}));
    server = await createServer();
    server.route(logoutRoute);

    // Populate the session within the same request so the handler can read it.
    server.ext("onPreHandler", (request, h) => {
      if (request.headers["x-seed-credentials"]) {
        request.yar.set("credentials", SEEDED_CREDENTIALS);
      }
      return h.continue;
    });

    await server.initialize();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await server.stop();
    Bell.simulate(false);
  });

  it("clears the session", async () => {
    server.route({
      method: "GET",
      path: "/add-to-session",
      handler: (request, h) => {
        request.yar.set("foo", {
          value: true,
        });

        return h.response().code(204);
      },
    });

    await server.inject({
      method: "GET",
      url: "/add-to-session",
      auth: {
        strategy: "msEntraId",
        credentials: {},
      },
    });

    const logoutResponse = await server.inject({
      method: "GET",
      url: "/logout",
      auth: {
        strategy: "msEntraId",
        credentials: {},
      },
    });

    expect(logoutResponse.request.yar.get("foo")).toBeNull();
  });

  it("redirects to the home page", async () => {
    const { headers, statusCode } = await server.inject({
      method: "GET",
      url: "/logout",
    });

    expect(statusCode).toEqual(302);
    expect(headers.location).toEqual("/");
  });

  it("records a logout audit event for the logged-in user", async () => {
    const { statusCode } = await server.inject({
      method: "GET",
      url: "/logout",
      headers: { "x-seed-credentials": "1" },
    });

    expect(statusCode).toEqual(302);
    expect(logoutUserUseCase).toHaveBeenCalledWith(
      { token: "mock-token" },
      { userId: "69691417bd385df3ac6aa25f" },
    );
  });

  it("still logs out when no user is in the session", async () => {
    const { statusCode } = await server.inject({
      method: "GET",
      url: "/logout",
    });

    expect(statusCode).toEqual(302);
    expect(logoutUserUseCase).not.toHaveBeenCalled();
  });

  it("still logs out when audit recording fails", async () => {
    logoutUserUseCase.mockRejectedValueOnce(new Error("backend down"));

    const { statusCode, headers } = await server.inject({
      method: "GET",
      url: "/logout",
      headers: { "x-seed-credentials": "1" },
    });

    expect(statusCode).toEqual(302);
    expect(headers.location).toEqual("/");
  });
});

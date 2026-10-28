import { ResponseBodyError } from "openid-client";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { loginUserUseCase } from "../../../auth/use-cases/login-user.use-case.js";
import { createServer } from "../../index.js";
import { redirectCookieName } from "./redirect-cookie.js";

const createToken = (data) => {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64");

  const payload = Buffer.from(
    JSON.stringify({
      oid: "12345678-1234-1234-1234-123456789012",
      name: "Casey Test",
      email: "casey.test@example.test",
      roles: ["FCP.Casework.Read"],
      exp: new Date("2050-01-01T00:00:00Z").getTime() / 1000,
      ...data,
    }),
  ).toString("base64");

  return `${header}.${payload}.qWxFhcz_GLCRL6LCDCUBg3JBdqw79Y31-_kkM--8nwQ`;
};

const accessToken = createToken({});
const freshAccessToken = createToken({
  exp: new Date("2055-01-01T00:00:00Z").getTime() / 1000,
});

const user = {
  id: "43e8508b-6cbd-4ac1-b29e-e73792ab0f4b",
  idpRoles: ["FCP.Casework.Read"],
};

const refreshRejected = () =>
  new ResponseBodyError("invalid_grant", {
    cause: {
      error: "invalid_grant",
      error_description: "AADSTS70008: The refresh token has expired.",
    },
    response: { status: 400 },
  });

vi.mock("../../../auth/use-cases/login-user.use-case.js");

describe("sessionScheme", () => {
  let server;

  beforeAll(async () => {
    server = await createServer();

    server.route({
      method: "POST",
      path: "/setup-session",
      options: { auth: false },
      handler(request, h) {
        request.yar.set("credentials", request.payload);
        return h.response().code(204);
      },
    });

    server.route({
      method: "GET",
      path: "/protected",
      handler: (request) => request.auth.credentials,
    });

    await server.initialize();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    loginUserUseCase.mockResolvedValue(user);
  });

  afterAll(async () => {
    await server.stop();
  });

  const signIn = async (credentials) => {
    const { headers } = await server.inject({
      method: "POST",
      url: "/setup-session",
      payload: credentials,
    });

    return headers["set-cookie"][0].split(";")[0];
  };

  const visitProtected = (cookie) =>
    server.inject({ method: "GET", url: "/protected", headers: { cookie } });

  const validSession = {
    token: accessToken,
    refreshToken: "refresh-token",
    expiresAt: new Date("2050-01-01T00:00:00Z").getTime(),
    user,
  };

  it("sends a user with no session to login, remembering where they were", async () => {
    const { statusCode, headers } = await server.inject({
      method: "GET",
      url: "/protected?page=2",
    });

    expect(statusCode).toEqual(302);
    expect(headers.location).toEqual("/login");
    expect(headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`${redirectCookieName}=`),
      ]),
    );
  });

  it("lets a user with a live token through untouched", async () => {
    server.plugins["hapi-auth-oidc"].oidc.ensureValidToken = async (
      _request,
      token,
    ) => ({ token, refreshed: false });

    const cookie = await signIn(validSession);
    const { statusCode, result } = await visitProtected(cookie);

    expect(statusCode).toEqual(200);
    expect(result).toEqual(validSession);
    expect(loginUserUseCase).not.toHaveBeenCalled();
  });

  // The field names differ either side of this boundary, and getting the
  // adapter wrong would silently never refresh.
  it("hands the library the token under the names it expects", async () => {
    const ensureValidToken = vi
      .fn()
      .mockImplementation(async (_request, token) => ({
        token,
        refreshed: false,
      }));
    server.plugins["hapi-auth-oidc"].oidc.ensureValidToken = ensureValidToken;

    await visitProtected(await signIn(validSession));

    expect(ensureValidToken).toHaveBeenCalledWith(expect.anything(), {
      accessToken,
      refreshToken: "refresh-token",
    });
  });

  it("rewrites the session and re-syncs roles when the token is refreshed", async () => {
    server.plugins["hapi-auth-oidc"].oidc.ensureValidToken = async () => ({
      token: {
        accessToken: freshAccessToken,
        refreshToken: "new-refresh-token",
        expiresIn: 3600,
      },
      refreshed: true,
    });

    loginUserUseCase.mockResolvedValue({
      id: user.id,
      idpRoles: ["FCP.Casework.ReadWrite"],
    });

    const { statusCode, result } = await visitProtected(
      await signIn(validSession),
    );

    expect(statusCode).toEqual(200);
    expect(result).toEqual({
      token: freshAccessToken,
      refreshToken: "new-refresh-token",
      expiresAt: new Date("2055-01-01T00:00:00Z").getTime(),
      user: {
        id: user.id,
        idpRoles: ["FCP.Casework.ReadWrite"],
      },
    });

    // Without this the roles the UI shows would be frozen at sign in, where
    // the old hourly bounce through /login refreshed them for free.
    expect(loginUserUseCase).toHaveBeenCalledWith({
      token: freshAccessToken,
      profile: expect.objectContaining({
        oid: "12345678-1234-1234-1234-123456789012",
      }),
    });
  });

  it("ends the session when Entra rejects the refresh token", async () => {
    server.plugins["hapi-auth-oidc"].oidc.ensureValidToken = async () => {
      throw refreshRejected();
    };

    const cookie = await signIn(validSession);
    const { statusCode, headers } = await visitProtected(cookie);

    expect(statusCode).toEqual(302);
    expect(headers.location).toEqual("/login");

    server.plugins["hapi-auth-oidc"].oidc.ensureValidToken = async (
      _request,
      token,
    ) => ({ token, refreshed: false });

    const { statusCode: afterClearing } = await visitProtected(cookie);
    expect(afterClearing).toEqual(302);
  });

  // Signing a user out because Entra was briefly unreachable would lose their
  // in-progress work, so the session stays and the request fails instead.
  it("keeps the session when the refresh fails transiently", async () => {
    const transient = new Error("socket hang up");
    transient.code = "ECONNRESET";

    server.plugins["hapi-auth-oidc"].oidc.ensureValidToken = async () => {
      throw transient;
    };

    const cookie = await signIn(validSession);
    const { statusCode } = await visitProtected(cookie);

    expect(statusCode).toEqual(503);

    server.plugins["hapi-auth-oidc"].oidc.ensureValidToken = async (
      _request,
      token,
    ) => ({ token, refreshed: false });

    const { statusCode: onceEntraIsBack } = await visitProtected(cookie);
    expect(onceEntraIsBack).toEqual(200);
  });

  // The deploy-safety property: a session written by the previous release is
  // read by this one, so nobody is signed out mid rolling deploy.
  it("accepts a session written by the previous release", async () => {
    server.plugins["hapi-auth-oidc"].oidc.ensureValidToken = async (
      _request,
      token,
    ) => ({ token, refreshed: false });

    const cookie = await signIn({
      token: accessToken,
      refreshToken: "refresh-token",
      expiresAt: Date.now() + 3600000,
      user: { id: user.id, idpRoles: ["FCP.Casework.Read"] },
    });

    const { statusCode } = await visitProtected(cookie);

    expect(statusCode).toEqual(200);
  });
});

import { ResponseBodyError } from "openid-client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loginUserUseCase } from "../../../auth/use-cases/login-user.use-case.js";
import { sessionScheme } from "./session-scheme.js";

vi.mock("../../../auth/use-cases/login-user.use-case.js");

const createToken = (payload) => {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");

  return [
    encode({ alg: "HS256", typ: "JWT" }),
    encode(payload),
    "qWxFhcz_GLCRL6LCDCUBg3JBdqw79Y31-_kkM--8nwQ",
  ].join(".");
};

const accessToken = createToken({
  oid: "12345678-1234-1234-1234-123456789012",
  name: "Bob Bill",
  email: "bob.bill@defra.gov.uk",
  roles: ["FCP.Casework.Read"],
});

const existingSession = {
  token: "old-access-token",
  refreshToken: "old-refresh-token",
  expiresAt: Date.now() + 3600000,
  user: {
    id: "43e8508b-6cbd-4ac1-b29e-e73792ab0f4b",
    idpRoles: ["FCP.Casework.Read"],
  },
};

const createRequest = (session) => ({
  url: { pathname: "/cases/123", search: "" },
  yar: {
    get: vi.fn(() => session),
    set: vi.fn(),
    clear: vi.fn(),
  },
  ensureValidToken: vi.fn(),
});

const createToolkit = () => {
  const response = {
    state: vi.fn(() => response),
    takeover: vi.fn(() => response),
    isRedirect: true,
  };

  return {
    redirect: vi.fn(() => response),
    authenticated: vi.fn((value) => ({ authenticated: value })),
    response,
  };
};

// openid-client's constructor signature is not public API, so build the error
// by prototype rather than by calling it.
const responseBodyError = () =>
  Object.create(ResponseBodyError.prototype, {
    message: { value: "invalid_grant" },
  });

describe("sessionScheme", () => {
  let h;

  beforeEach(() => {
    h = createToolkit();
  });

  it("redirects to login, remembering the deep link, when there is no session", async () => {
    const request = createRequest(null);

    await sessionScheme().authenticate(request, h);

    expect(h.redirect).toHaveBeenCalledWith("/login");
    expect(h.response.state).toHaveBeenCalledWith(
      "auth-redirect",
      "/cases/123",
    );
    expect(h.response.takeover).toHaveBeenCalled();
  });

  it("authenticates without touching the session when the token is still valid", async () => {
    const request = createRequest(existingSession);
    request.ensureValidToken.mockResolvedValue({
      token: existingSession,
      refreshed: false,
    });

    const result = await sessionScheme().authenticate(request, h);

    expect(request.ensureValidToken).toHaveBeenCalledWith({
      accessToken: existingSession.token,
      refreshToken: existingSession.refreshToken,
    });
    expect(request.yar.set).not.toHaveBeenCalled();
    expect(loginUserUseCase).not.toHaveBeenCalled();
    expect(result).toEqual({ authenticated: { credentials: existingSession } });
  });

  it("refreshes silently and keeps the user working when the token has expired", async () => {
    const request = createRequest(existingSession);
    request.ensureValidToken.mockResolvedValue({
      token: {
        accessToken,
        refreshToken: "new-refresh-token",
        expiresIn: 3600,
      },
      refreshed: true,
    });
    loginUserUseCase.mockResolvedValue({
      id: "43e8508b-6cbd-4ac1-b29e-e73792ab0f4b",
      idpRoles: ["FCP.Casework.ReadWrite"],
    });

    const result = await sessionScheme().authenticate(request, h);

    expect(request.yar.set).toHaveBeenCalledWith("credentials", {
      token: accessToken,
      refreshToken: "new-refresh-token",
      expiresAt: expect.any(Number),
      user: {
        id: "43e8508b-6cbd-4ac1-b29e-e73792ab0f4b",
        idpRoles: ["FCP.Casework.ReadWrite"],
      },
    });
    expect(h.redirect).not.toHaveBeenCalled();
    expect(result.authenticated.credentials.token).toBe(accessToken);
  });

  it("re-syncs roles from the backend on refresh, so they cannot go stale for the session ttl", async () => {
    const request = createRequest(existingSession);
    request.ensureValidToken.mockResolvedValue({
      token: { accessToken, refreshToken: "r", expiresIn: 3600 },
      refreshed: true,
    });
    loginUserUseCase.mockResolvedValue({ id: "an-id", idpRoles: [] });

    await sessionScheme().authenticate(request, h);

    expect(loginUserUseCase).toHaveBeenCalledWith({
      token: accessToken,
      profile: {
        oid: "12345678-1234-1234-1234-123456789012",
        name: "Bob Bill",
        email: "bob.bill@defra.gov.uk",
        roles: ["FCP.Casework.Read"],
      },
    });
  });

  it("ends the session and returns to login when Entra rejects the refresh token", async () => {
    const request = createRequest(existingSession);
    request.ensureValidToken.mockRejectedValue(responseBodyError());

    await sessionScheme().authenticate(request, h);

    expect(request.yar.clear).toHaveBeenCalledWith("credentials");
    expect(h.redirect).toHaveBeenCalledWith("/login");
    expect(h.response.state).toHaveBeenCalledWith(
      "auth-redirect",
      "/cases/123",
    );
  });

  it("keeps the session and fails the request when the refresh fails transiently", async () => {
    const request = createRequest(existingSession);
    request.ensureValidToken.mockRejectedValue(new Error("socket hang up"));

    await expect(sessionScheme().authenticate(request, h)).rejects.toThrow(
      "Could not refresh the session",
    );

    expect(request.yar.clear).not.toHaveBeenCalled();
    expect(h.redirect).not.toHaveBeenCalled();
  });
});

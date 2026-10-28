import { describe, expect, it, vi } from "vitest";
import {
  clearAuthSession,
  getAuthSession,
  profileFromAccessToken,
  sessionKey,
  setAuthSession,
  toCredentials,
} from "./session.js";

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

const yar = (stored) => ({
  yar: {
    get: vi.fn().mockReturnValue(stored),
    set: vi.fn(),
    clear: vi.fn(),
  },
});

describe("profileFromAccessToken", () => {
  // The id token carries no `roles`; only the token addressed to
  // fg-cw-backend does, and the UI gates on it.
  it("reads the profile from the access token", () => {
    expect(profileFromAccessToken(createToken({}))).toEqual({
      oid: "12345678-1234-1234-1234-123456789012",
      name: "Casey Test",
      email: "casey.test@example.test",
      roles: ["FCP.Casework.Read"],
    });
  });

  it("treats a token with no roles claim as having none", () => {
    expect(
      profileFromAccessToken(createToken({ roles: undefined })).roles,
    ).toEqual([]);
  });
});

describe("toCredentials", () => {
  // Containers running the previous release still read `expiresAt`, and every
  // route handler reads `token`, so a rolling deploy depends on these names.
  it("keeps the session shape the rest of the app reads", () => {
    const accessToken = createToken({});

    expect(
      toCredentials(
        { accessToken, refreshToken: "refresh-token", expiresIn: 3600 },
        { id: "user-1", idpRoles: ["FCP.Casework.Read"], name: "Casey Test" },
      ),
    ).toEqual({
      token: accessToken,
      refreshToken: "refresh-token",
      expiresAt: new Date("2050-01-01T00:00:00Z").getTime(),
      user: {
        id: "user-1",
        idpRoles: ["FCP.Casework.Read"],
      },
    });
  });

  it("takes expiry from the token itself rather than the grant", () => {
    const { expiresAt } = toCredentials(
      {
        accessToken: createToken({
          exp: new Date("2040-06-01T00:00:00Z").getTime() / 1000,
        }),
        refreshToken: "refresh-token",
        expiresIn: 60,
      },
      { id: "user-1", idpRoles: [] },
    );

    expect(expiresAt).toEqual(new Date("2040-06-01T00:00:00Z").getTime());
  });
});

describe("the session store", () => {
  it("reads and writes under the key the app has always used", () => {
    const request = yar({ token: "access-token" });

    expect(getAuthSession(request)).toEqual({ token: "access-token" });
    expect(request.yar.get).toHaveBeenCalledWith(sessionKey);

    setAuthSession(request, { token: "new-token" });
    expect(request.yar.set).toHaveBeenCalledWith(sessionKey, {
      token: "new-token",
    });
  });

  it("reports an absent session as undefined rather than null", () => {
    expect(getAuthSession(yar(null))).toBeUndefined();
  });

  // Narrower than yar.reset(), so flash messages and anything else held
  // alongside survive a refresh failure.
  it("clears only the credentials", () => {
    const request = yar(null);

    clearAuthSession(request);

    expect(request.yar.clear).toHaveBeenCalledWith(sessionKey);
  });
});

import { describe, expect, it, vi } from "vitest";
import {
  clearAuthSession,
  getAuthSession,
  profileFromAccessToken,
  setAuthSession,
  toSession,
} from "./session.js";

const createToken = (payload) => {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");

  return [
    encode({ alg: "HS256", typ: "JWT" }),
    encode(payload),
    "qWxFhcz_GLCRL6LCDCUBg3JBdqw79Y31-_kkM--8nwQ",
  ].join(".");
};

const createRequest = (stored) => ({
  yar: {
    get: vi.fn(() => stored),
    set: vi.fn(),
    clear: vi.fn(),
  },
});

describe("getAuthSession", () => {
  it("reads the session yar key bell used", () => {
    const request = createRequest({ token: "a" });

    expect(getAuthSession(request)).toEqual({ token: "a" });
    expect(request.yar.get).toHaveBeenCalledWith("credentials");
  });

  it("returns null when there is no session", () => {
    expect(getAuthSession(createRequest(null))).toBeNull();
  });
});

describe("setAuthSession", () => {
  it("writes to the session yar key bell used", () => {
    const request = createRequest();

    setAuthSession(request, { token: "a" });

    expect(request.yar.set).toHaveBeenCalledWith("credentials", { token: "a" });
  });
});

describe("clearAuthSession", () => {
  it("clears the session yar key bell used", () => {
    const request = createRequest();

    clearAuthSession(request);

    expect(request.yar.clear).toHaveBeenCalledWith("credentials");
  });
});

describe("profileFromAccessToken", () => {
  it("reads the profile from the access token, not the id token", () => {
    const accessToken = createToken({
      oid: "12345678-1234-1234-1234-123456789012",
      name: "Bob Bill",
      email: "bob.bill@defra.gov.uk",
      roles: ["FCP.Casework.Read"],
    });

    expect(profileFromAccessToken(accessToken)).toEqual({
      oid: "12345678-1234-1234-1234-123456789012",
      name: "Bob Bill",
      email: "bob.bill@defra.gov.uk",
      roles: ["FCP.Casework.Read"],
    });
  });

  it("defaults roles to an empty array when the claim is absent", () => {
    const accessToken = createToken({ oid: "an-oid" });

    expect(profileFromAccessToken(accessToken).roles).toEqual([]);
  });
});

describe("toSession", () => {
  it("builds the session shape bell wrote, so live sessions survive the deploy", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    const session = toSession({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      expiresIn: 3600,
      user: {
        id: "43e8508b-6cbd-4ac1-b29e-e73792ab0f4b",
        idpRoles: ["FCP.Casework.Read"],
        name: "Bob Bill",
      },
    });

    expect(session).toEqual({
      token: "access-token",
      refreshToken: "refresh-token",
      expiresAt: new Date("2026-01-01T01:00:00Z").getTime(),
      user: {
        id: "43e8508b-6cbd-4ac1-b29e-e73792ab0f4b",
        idpRoles: ["FCP.Casework.Read"],
      },
    });

    vi.useRealTimers();
  });
});

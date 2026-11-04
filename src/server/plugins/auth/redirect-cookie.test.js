import { describe, expect, it, vi } from "vitest";
import {
  redirectCookieName,
  redirectCookieOptions,
  redirectToWithMemory,
  takeRedirectTo,
} from "./redirect-cookie.js";

const toolkit = () => {
  const response = { state: vi.fn() };
  response.state.mockReturnValue(response);

  return {
    redirect: vi.fn().mockReturnValue(response),
    unstate: vi.fn(),
    response,
  };
};

describe("redirectToWithMemory", () => {
  it("remembers the path and query the user asked for", () => {
    const h = toolkit();
    const request = { url: { pathname: "/cases", search: "?page=2" } };

    redirectToWithMemory(request, h, "/login");

    expect(h.redirect).toHaveBeenCalledWith("/login");
    expect(h.response.state).toHaveBeenCalledWith(
      redirectCookieName,
      "/cases?page=2",
    );
  });
});

describe("takeRedirectTo", () => {
  it("returns the remembered destination and spends the cookie", () => {
    const h = toolkit();
    const request = { state: { [redirectCookieName]: "/cases/123" } };

    expect(takeRedirectTo(request, h)).toEqual("/cases/123");
    expect(h.unstate).toHaveBeenCalledWith(redirectCookieName);
  });

  it("falls back to the home page when nothing was remembered", () => {
    expect(takeRedirectTo({ state: {} }, toolkit())).toEqual("/");
  });

  // `//host` reads to a browser as protocol relative, and the url parser
  // treats a leading backslash as a slash, so both would leave the service.
  it.each([
    "//evil.test",
    "/\\evil.test",
    "https://evil.test/",
    "evil.test",
    "",
    42,
  ])("refuses to send the user off site to %s", (hostile) => {
    const request = { state: { [redirectCookieName]: hostile } };

    expect(takeRedirectTo(request, toolkit())).toEqual("/");
  });
});

describe("redirectCookieOptions", () => {
  // The cookie has to survive Entra's cross-site POST back, which the
  // SameSite=Strict session cookie does not.
  it("is relaxed for the cross-site return and tamper proof", () => {
    expect(redirectCookieOptions).toMatchObject({
      encoding: "iron",
      isHttpOnly: true,
      isSameSite: redirectCookieOptions.isSecure ? "None" : "Lax",
    });
  });
});

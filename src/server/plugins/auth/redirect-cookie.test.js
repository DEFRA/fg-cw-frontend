import { describe, expect, it, vi } from "vitest";
import {
  redirectCookieName,
  redirectCookieOptions,
  redirectToWithMemory,
  takeRedirectTo,
} from "./redirect-cookie.js";

const createToolkit = () => {
  const response = { state: vi.fn(() => response) };

  return {
    redirect: vi.fn(() => response),
    unstate: vi.fn(),
    response,
  };
};

describe("redirectCookieOptions", () => {
  it("is iron encoded so it cannot be rewritten into an open redirect", () => {
    expect(redirectCookieOptions.encoding).toBe("iron");
    expect(redirectCookieOptions.isHttpOnly).toBe(true);
  });
});

describe("redirectToWithMemory", () => {
  it("remembers the path and query the user asked for", () => {
    const h = createToolkit();
    const request = { url: { pathname: "/cases/123", search: "?tab=notes" } };

    redirectToWithMemory(request, h, "/login");

    expect(h.redirect).toHaveBeenCalledWith("/login");
    expect(h.response.state).toHaveBeenCalledWith(
      redirectCookieName,
      "/cases/123?tab=notes",
    );
  });
});

describe("takeRedirectTo", () => {
  it("returns the remembered path and clears the cookie", () => {
    const h = createToolkit();
    const request = { state: { [redirectCookieName]: "/cases/123" } };

    expect(takeRedirectTo(request, h)).toBe("/cases/123");
    expect(h.unstate).toHaveBeenCalledWith(redirectCookieName);
  });

  it("falls back to / when nothing was remembered", () => {
    expect(takeRedirectTo({ state: {} }, createToolkit())).toBe("/");
  });

  it.each([
    ["//evil.test", "protocol relative"],
    ["/\\evil.test", "backslash, which url parsers read as a slash"],
    ["https://evil.test", "absolute"],
    ["cases", "not rooted"],
    [123, "not a string"],
  ])("refuses %s (%s) and falls back to /", (redirectTo) => {
    const request = { state: { [redirectCookieName]: redirectTo } };

    expect(takeRedirectTo(request, createToolkit())).toBe("/");
  });
});

import { describe, expect, it } from "vitest";
import { continuePage } from "./continue-page.js";

describe("continuePage", () => {
  it("sends the browser onward without the user having to act", () => {
    expect(continuePage("/cases/123")).toContain(
      '<meta http-equiv="refresh" content="0;url=/cases/123">',
    );
  });

  it("offers a link for a browser that will not follow the refresh", () => {
    expect(continuePage("/cases/123")).toContain('<a href="/cases/123">');
  });

  // On the `query` response mode the url this page is served at carries the
  // authorisation code, which must not leak to the destination.
  it("withholds the referrer", () => {
    expect(continuePage("/")).toContain(
      '<meta name="referrer" content="no-referrer">',
    );
  });

  it("escapes the destination rather than letting it close the attribute", () => {
    const page = continuePage('/cases"><script>alert(1)</script>');

    expect(page).not.toContain("<script>");
    expect(page).toContain("&#60;script&#62;");
  });
});

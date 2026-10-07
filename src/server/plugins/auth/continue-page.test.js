import { describe, expect, it } from "vitest";
import { continuePage } from "./continue-page.js";

describe("continuePage", () => {
  it("navigates onwards from a document of ours, so the SameSite=Strict session cookie rides it", () => {
    const page = continuePage("/cases/123");

    expect(page).toContain(
      '<meta http-equiv="refresh" content="0;url=/cases/123">',
    );
    expect(page).toContain('<a href="/cases/123">Continue</a>');
  });

  it("withholds the referrer, which on the query response mode carries the auth code", () => {
    expect(continuePage("/")).toContain(
      '<meta name="referrer" content="no-referrer">',
    );
  });

  it("escapes the destination so it cannot break out of the attribute", () => {
    const page = continuePage('/cases"><script>alert(1)</script>');

    expect(page).not.toContain("<script>");
    expect(page).toContain("&#34;&#62;&#60;script&#62;");
  });
});

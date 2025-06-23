import { describe, expect, it } from "vitest";
import { validateSession } from "./auth.js";

describe("auth", () => {
  it("should validate session", () => {
    const session = {
      profile: {
        displayName: "Joseph Bloggs",
      },
    };
    expect(validateSession({}, session)).toEqual({
      isValid: true,
      credentials: session,
    });
  });

  it("should return invalid if no session", () => {
    expect(validateSession({}, null)).toEqual({
      isValid: false,
    });
  });

  it("should return invalid if no session.profile", () => {
    const session = {};
    expect(validateSession({}, session)).toEqual({
      isValid: false,
    });
  });
});

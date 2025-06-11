import { describe, expect, test } from "vitest";
import { buildNavigation } from "./build-navigation.js";

describe("#buildNavigation", () => {
  test("Should provide expected navigation details", () => {
    expect(buildNavigation({ path: "/non-existent-path" })).toEqual([
      {
        isActive: false,
        text: "Cases",
        url: "/cases",
      },
    ]);
  });

  test("Should provide expected highlighted navigation details", () => {
    expect(buildNavigation({ path: "/" })).toEqual([
      {
        isActive: true,
        text: "Cases",
        url: "/cases",
      },
    ]);
  });
});

import { describe, expect, it } from "vitest";
import { getLabelText } from "./string-helpers.js";

describe("getLabelText", () => {
  it("should return a string label as-is", () => {
    expect(getLabelText("My label")).toBe("My label");
  });

  it("should return the text property from an object label", () => {
    expect(getLabelText({ text: "My label", classes: "govuk-label--m" })).toBe(
      "My label",
    );
  });

  it("should return the text property from an object label with empty string", () => {
    expect(getLabelText({ text: "" })).toBe("");
  });
});

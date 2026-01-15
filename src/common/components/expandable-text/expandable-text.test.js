import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExpandableText } from "./expandable-text.js";

describe("ExpandableText", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("expands content when toggle is clicked", () => {
    document.body.innerHTML = `
      <div class="expandable-text">
        <a href="#" class="expandable-text__toggle" aria-expanded="false">Show more</a>
        <span class="expandable-text__content">Short</span>
        <span class="expandable-text__full-content">Full content</span>
      </div>
    `;

    const root = document.querySelector(".expandable-text");
    const component = new ExpandableText(root);

    const event = { preventDefault: vi.fn() };
    component.handleToggle(event);

    const toggle = root.querySelector(".expandable-text__toggle");
    const content = root.querySelector(".expandable-text__content");

    expect(event.preventDefault).toHaveBeenCalled();
    expect(toggle.getAttribute("aria-expanded")).toEqual("true");
    expect(content.textContent).toEqual("Full content");
    expect(toggle.style.display).toEqual("none");
  });

  it("handles missing toggle", () => {
    document.body.innerHTML = `
      <div class="expandable-text">
        <span class="expandable-text__content">Short</span>
        <span class="expandable-text__full-content">Full content</span>
      </div>
    `;

    const root = document.querySelector(".expandable-text");

    expect(() => new ExpandableText(root)).not.toThrow();
  });

  it("has correct module name", () => {
    expect(ExpandableText.moduleName).toBe("expandable-text");
  });
});

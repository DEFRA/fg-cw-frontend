import { describe, expect, it } from "vitest";
import { setActiveLink } from "./navigation-helpers.js";

describe("setActiveLink", () => {
  it("sets the correct link as active", () => {
    const links = [
      { id: "tasks", text: "Tasks", href: "/cases/123" },
      { id: "notes", text: "Notes", href: "/cases/123/notes" },
      { id: "timeline", text: "Timeline", href: "/cases/123/timeline" },
    ];

    const result = setActiveLink(links, "notes");

    expect(result).toEqual([
      { id: "tasks", text: "Tasks", href: "/cases/123", active: false },
      { id: "notes", text: "Notes", href: "/cases/123/notes", active: true },
      {
        id: "timeline",
        text: "Timeline",
        href: "/cases/123/timeline",
        active: false,
      },
    ]);
  });

  it("returns empty array when no links provided", () => {
    const result = setActiveLink();

    expect(result).toEqual([]);
  });

  it("returns empty array when empty links array provided", () => {
    const result = setActiveLink([]);

    expect(result).toEqual([]);
  });

  it("sets no link as active when activeId is empty string", () => {
    const links = [
      { id: "tasks", text: "Tasks", href: "/cases/123" },
      { id: "notes", text: "Notes", href: "/cases/123/notes" },
    ];

    const result = setActiveLink(links, "");

    expect(result).toEqual([
      { id: "tasks", text: "Tasks", href: "/cases/123", active: false },
      { id: "notes", text: "Notes", href: "/cases/123/notes", active: false },
    ]);
  });

  it("handles non-existent activeId", () => {
    const links = [
      { id: "tasks", text: "Tasks", href: "/cases/123" },
      { id: "notes", text: "Notes", href: "/cases/123/notes" },
    ];

    const result = setActiveLink(links, "nonexistent");

    expect(result).toEqual([
      { id: "tasks", text: "Tasks", href: "/cases/123", active: false },
      { id: "notes", text: "Notes", href: "/cases/123/notes", active: false },
    ]);
  });
});

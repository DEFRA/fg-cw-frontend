import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("notes-history-table", () => {
  test("renders table with notes history", () => {
    const component = render("notes-history-table", {
      notesHistory: [
        {
          date: "2025-09-25T14:30:00.000Z",
          outcome: "Accepted",
          note: "request",
          addedBy: "A Jones",
        },
        {
          date: "2025-09-20T10:15:00.000Z",
          outcome: "Request information from customer",
          note: "Waiting for customer to provide updated bank details",
          addedBy: "B Smith",
        },
      ],
    });

    expect(component).toMatchSnapshot();
  });

  test("renders nothing when notesHistory is empty", () => {
    const component = render("notes-history-table", {
      notesHistory: [],
    });

    expect(component.trim()).toBe("");
  });

  test("renders nothing when notesHistory is undefined", () => {
    const component = render("notes-history-table", {});

    expect(component.trim()).toBe("");
  });

  test("renders nothing when notesHistory is null", () => {
    const component = render("notes-history-table", {
      notesHistory: null,
    });

    expect(component.trim()).toBe("");
  });

  test("handles null values in note fields", () => {
    const component = render("notes-history-table", {
      notesHistory: [
        {
          date: "2025-09-25T14:30:00.000Z",
          outcome: null,
          note: null,
          addedBy: null,
        },
      ],
    });

    expect(component).toMatchSnapshot();
  });

  test("renders single note correctly", () => {
    const component = render("notes-history-table", {
      notesHistory: [
        {
          date: "2025-09-25T14:30:00.000Z",
          outcome: "Accepted",
          note: "Approved after review",
          addedBy: "A Jones",
        },
      ],
    });

    expect(component).toMatchSnapshot();
  });

  test("formats dates correctly with short month format", () => {
    const component = render("notes-history-table", {
      notesHistory: [
        {
          date: "2025-09-01T10:00:00.000Z",
          outcome: "Accepted",
          note: "First day test",
          addedBy: "Test User",
        },
        {
          date: "2025-09-02T10:00:00.000Z",
          outcome: "Rejected",
          note: "Second day test",
          addedBy: "Test User",
        },
        {
          date: "2025-09-03T10:00:00.000Z",
          outcome: "Pending",
          note: "Third day test",
          addedBy: "Test User",
        },
        {
          date: "2025-09-21T10:00:00.000Z",
          outcome: "Approved",
          note: "Twenty-first day test",
          addedBy: "Test User",
        },
      ],
    });

    expect(component).toMatchSnapshot();
  });
});

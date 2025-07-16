import { describe, expect, it } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("timeline-item-title", () => {
  it("renders case assigned view", () => {
    const component = render("timeline-item-title", {
      eventType: "CASE_ASSIGNED",
      description: "Case assigned",
      data: { assignedTo: { name: "Mickey Mouse" } },
    });
    expect(component).toMatchSnapshot();
  });

  it("renders other view", () => {
    const component = render("timeline-item-title", {
      eventType: "NOTE_ADDED",
      description: "Note added",
    });

    expect(component).toMatchSnapshot();
  });
});

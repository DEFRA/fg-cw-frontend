import { describe, expect, it } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("timeline-item-description", () => {
  it("renders case assigned view", () => {
    const component = render("timeline-item-description", {
      eventType: "CASE_ASSIGNED",
      commentRef: "12334-POPOP",
      caseId: "9999-00000",
      data: {
        assignedTo: { name: "Mickey Mouse" },
      },
    });
    expect(component).toMatchSnapshot();
  });

  it("renders other view", () => {
    const component = render("timeline-item-description", {
      eventType: "NOTE_ADDED",
    });

    expect(component).toMatchSnapshot();
  });
});

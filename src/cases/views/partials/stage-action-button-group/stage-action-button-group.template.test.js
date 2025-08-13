import { describe, expect, it } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("stage-action-button-group", () => {
  it("renders multiple buttons", () => {
    const component = render("stage-action-button-group", {
      buttons: [
        {
          label: "Approve",
          testId: "approve-button",
          nextStage: "approved",
        },
        {
          label: "Reject",
          testId: "reject-button",
          nextStage: "rejected",
        },
      ],
      caseId: "123",
      allTasksComplete: true,
    });
    expect(component).toMatchSnapshot();
  });

  it("disables buttons if allTasksComplete is false", () => {
    const component = render("stage-action-button-group", {
      buttons: [
        {
          label: "Approve",
          testId: "approve-button",
          nextStage: "approved",
        },
        {
          label: "Reject",
          testId: "reject-button",
          nextStage: "rejected",
        },
      ],
      caseId: "123",
      allTasksComplete: false,
    });
    expect(component).toMatchSnapshot();
  });

  it("does not render when no buttons provided", () => {
    const component = render("stage-action-button-group", {
      buttons: [],
      caseId: "123",
    });

    expect(component).toMatchSnapshot();
  });
});

import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("stage-action-button-group", () => {
  test("renders multiple buttons", () => {
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
    });
    expect(component).toMatchSnapshot();
  });

  test("does not render when no buttons provided", () => {
    const component = render("stage-action-button-group", {
      buttons: [],
      caseId: "123",
    });

    expect(component).toMatchSnapshot();
  });
});

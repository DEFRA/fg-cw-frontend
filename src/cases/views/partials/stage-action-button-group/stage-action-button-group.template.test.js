import { beforeEach, describe, expect, test } from "vitest";
import { renderComponent } from "../../../../server/common/test-helpers/component-helpers.js";

describe.skip("Stage Action Button Group Component", () => {
  let $buttonGroup;

  const mockParams = {
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
  };

  describe("Component with multiple buttons", () => {
    beforeEach(() => {
      $buttonGroup = renderComponent("stageActionButtonGroup", mockParams);
    });

    test("Should render a button group container", () => {
      expect($buttonGroup(".govuk-button-group").length).toBe(1);
    });

    test("Should render all buttons with correct labels", () => {
      const buttons = $buttonGroup("button");
      expect(buttons.length).toBe(2);
      expect(buttons.eq(0).text().trim()).toBe("Approve");
      expect(buttons.eq(1).text().trim()).toBe("Reject");
    });

    test("Should render buttons with correct form actions", () => {
      const buttons = $buttonGroup("button");
      expect(buttons.length).toBe(2);
      expect(buttons.eq(0).attr("formaction")).toBe("/cases/123");
      expect(buttons.eq(1).attr("formaction")).toBe("/cases/123");
    });

    test("Should render buttons with correct attributes", () => {
      const buttons = $buttonGroup("button");
      expect(buttons.eq(0).attr("data-prevent-double-click")).toBe("true");
      expect(buttons.eq(0).attr("class")).toBe("govuk-button");
      expect(buttons.eq(0).attr("data-module")).toBe("govuk-button");
      expect(buttons.eq(0).attr("data-govuk-button-init")).toBe("");
    });
  });

  describe("Component with no buttons", () => {
    beforeEach(() => {
      $buttonGroup = renderComponent("stageActionButtonGroup", {
        buttons: [],
        caseId: "123",
      });
    });

    test("Should not render any buttons", () => {
      expect($buttonGroup("button").length).toBe(0);
    });
  });
});

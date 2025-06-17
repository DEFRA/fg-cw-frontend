import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("case-details-tab-navigation", () => {
  test("renders", () => {
    const component = render("case-details-tab-navigation", {
      caseId: "123",
      active: true,
    });

    expect(component).toMatchSnapshot();
  });
});

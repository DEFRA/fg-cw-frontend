import { describe, expect, test } from "vitest";
import { render } from "../../nunjucks/render.js";

describe("checkbox", () => {
  test("renders", () => {
    const component = render("checkbox", {
      id: "checkbox-id",
      name: "checkbox-name",
      label: "Checkbox Label",
      value: "checkbox-value",
      suffix: "Checkbox Suffix",
    });

    expect(component).toMatchSnapshot();
  });
});

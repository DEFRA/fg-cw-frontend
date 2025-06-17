import { describe, expect, test } from "vitest";
import { render } from "../../nunjucks/render.js";

describe("heading", () => {
  test("renders", () => {
    const component = render("heading", {
      text: "Services",
      caption: "A page showing available services",
    });

    expect(component).toMatchSnapshot();
  });
});

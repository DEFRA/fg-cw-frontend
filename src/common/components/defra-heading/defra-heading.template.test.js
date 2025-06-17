import { describe, expect, test } from "vitest";
import { render } from "../../nunjucks/render.js";

describe("defra-heading", () => {
  test("renders", () => {
    const component = render("defra-heading", {
      serviceName: "Manage rural grant applications",
    });

    expect(component).toMatchSnapshot();
  });
});

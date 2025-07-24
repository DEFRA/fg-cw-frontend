import { describe, expect, test } from "vitest";
import { render } from "../../nunjucks/render.js";

describe("list", () => {
  test("renders list with fields and payload", () => {
    const fields = [
      {
        ref: "$.payload.answers.totalPigs",
        type: "number",
        label: "Total Pigs",
      },
      {
        ref: "$.payload.answers.isPigFarmer",
        type: "boolean",
        label: "Are you a pig farmer?",
      },
    ];

    const payload = {
      answers: {
        totalPigs: 10,
        isPigFarmer: true,
      },
    };

    const options = {
      fields,
      payload,
    };

    const component = render("list", options);
    expect(component).toMatchSnapshot();
  });

  test("renders nothing when no fields provided", () => {
    const component = render("list", {});
    expect(component.trim()).toBe("");
  });

  test("renders nothing when no payload provided", () => {
    const fields = [
      {
        ref: "$.payload.answers.totalPigs",
        type: "number",
        label: "Total Pigs",
      },
    ];

    const component = render("list", { fields });
    expect(component.trim()).toBe("");
  });
});

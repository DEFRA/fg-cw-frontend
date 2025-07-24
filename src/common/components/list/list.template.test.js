import { describe, expect, test } from "vitest";
import { render } from "../../nunjucks/render.js";

describe("list", () => {
  test("renders table with fields and processed values", () => {
    const fields = [
      {
        ref: "$.payload.answers.totalPigs",
        type: "number",
        label: "Total Pigs",
        value: 10,
      },
      {
        ref: "$.payload.answers.isPigFarmer",
        type: "boolean",
        label: "Are you a pig farmer?",
        value: true,
      },
      {
        ref: "$.payload.answers.farmName",
        type: "string",
        label: "Farm Name",
        value: "Green Acres Farm",
      },
    ];

    const options = {
      fields,
    };

    const component = render("list", options);
    expect(component).toMatchSnapshot();
  });

  test("renders table with boolean values converted to Yes/No", () => {
    const fields = [
      {
        ref: "$.payload.answers.isPigFarmer",
        type: "boolean",
        label: "Are you a pig farmer?",
        value: true,
      },
      {
        ref: "$.payload.answers.hasLicense",
        type: "boolean",
        label: "Do you have a license?",
        value: false,
      },
    ];

    const options = {
      fields,
    };

    const component = render("list", options);
    expect(component).toMatchSnapshot();
  });

  test("renders nothing when no fields provided", () => {
    const component = render("list", {});
    expect(component.trim()).toBe("");
  });

  test("renders empty table when fields array is empty", () => {
    const component = render("list", { fields: [] });
    expect(component).toMatchSnapshot();
  });

  test("renders table with null and undefined values", () => {
    const fields = [
      {
        ref: "$.payload.answers.totalPigs",
        type: "number",
        label: "Total Pigs",
        value: null,
      },
      {
        ref: "$.payload.answers.farmName",
        type: "string",
        label: "Farm Name",
        value: undefined,
      },
    ];

    const options = {
      fields,
    };

    const component = render("list", options);
    expect(component).toMatchSnapshot();
  });

  test("renders table with zero and empty string values", () => {
    const fields = [
      {
        ref: "$.payload.answers.totalPigs",
        type: "number",
        label: "Total Pigs",
        value: 0,
      },
      {
        ref: "$.payload.answers.farmName",
        type: "string",
        label: "Farm Name",
        value: "",
      },
    ];

    const options = {
      fields,
    };

    const component = render("list", options);
    expect(component).toMatchSnapshot();
  });
});

import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("case-summary", () => {
  test("renders without callToAction", () => {
    const component = render("case-summary", {
      banner: {
        title: {
          text: "Valley Farm",
          type: "string",
        },
        summary: {
          sbi: {
            label: "SBI",
            text: "SBI001",
            type: "string",
          },
          reference: {
            label: "Reference",
            text: "b18lb85",
            type: "string",
          },
          scheme: {
            label: "Scheme",
            text: "SFI",
            type: "string",
          },
        },
      },
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with callToAction buttons", () => {
    const component = render("case-summary", {
      banner: {
        title: {
          text: "Valley Farm",
          type: "string",
        },
        summary: {
          sbi: {
            label: "SBI",
            text: "SBI001",
            type: "string",
          },
          reference: {
            label: "Reference",
            text: "b18lb85",
            type: "string",
          },
        },
        callToAction: [
          {
            code: "RERUN_RULES",
            name: "Rerun Rules",
          },
          {
            code: "ANOTHER_ACTION",
            name: "Another Action",
          },
        ],
      },
    });

    expect(component).toMatchSnapshot();
  });
});

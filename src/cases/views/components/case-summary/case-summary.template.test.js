import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("case-summary", () => {
  test("renders", () => {
    const component = render("case-summary", {
      case: {
        caseRef: "banana-123",
        status: "NEW",
        businessName: "Test Business",
        sbi: "SBI001",
        code: "frps-private-beta",
        scheme: "SFI",
        dateReceived: "2025-06-11T10:43:01.603Z",
      },
    });

    expect(component).toMatchSnapshot();
  });
});

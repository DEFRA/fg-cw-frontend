import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("case-summary", () => {
  test("renders", () => {
    const component = render("case-summary", {
      case: {
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

  test("renders with external actions", () => {
    const component = render("case-summary", {
      _id: "case-123",
      banner: {
        title: { value: "Valley Farm" },
        summary: {
          sbi: { label: "SBI", text: "123456789" },
          status: { label: "Status", text: "Active" },
        },
        externalActions: [
          {
            code: "RERUN_RULES",
            name: "Rerun Rules",
            endpoint: "landGrantsRulesRerun",
          },
          {
            code: "CALCULATE_PAYMENT",
            name: "Calculate Payment",
            endpoint: "calculatePayment",
          },
        ],
      },
    });

    expect(component).toContain("Rerun Rules");
    expect(component).toContain("Calculate Payment");
  });

  test("renders without external actions when not defined", () => {
    const component = render("case-summary", {
      _id: "case-456",
      banner: {
        title: { value: "Test Farm" },
        summary: {
          sbi: { label: "SBI", text: "987654321" },
        },
      },
    });

    expect(component).not.toContain("moj-page-header-actions");
    expect(component).toContain("govuk-heading-m");
    expect(component).toContain("Test Farm");
  });

  test("renders without external actions when array is empty", () => {
    const component = render("case-summary", {
      _id: "case-789",
      banner: {
        title: { value: "Another Farm" },
        summary: {},
        externalActions: [],
      },
    });

    expect(component).not.toContain("moj-page-header-actions");
    expect(component).toContain("govuk-heading-m");
    expect(component).toContain("Another Farm");
  });

  test("renders with single external action", () => {
    const component = render("case-summary", {
      _id: "case-single",
      banner: {
        title: { value: "Single Action Farm" },
        externalActions: [
          {
            code: "SINGLE_ACTION",
            name: "Single Action",
            endpoint: "singleEndpoint",
          },
        ],
      },
    });

    expect(component).toContain("Single Action");
  });

  test("includes data attributes for action codes", () => {
    const component = render("case-summary", {
      _id: "case-data-attrs",
      banner: {
        title: { value: "Data Attrs Farm" },
        externalActions: [
          {
            code: "TEST_ACTION",
            name: "Test Action",
            endpoint: "testEndpoint",
          },
        ],
      },
    });

    expect(component).toContain('data-action-code="TEST_ACTION"');
  });
});

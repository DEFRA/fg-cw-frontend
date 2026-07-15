import { describe, expect, it } from "vitest";
import { createReportViewModel } from "./report.view-model.js";

const buildPage = (overrides = {}) => ({
  header: { navItems: [] },
  data: {
    selectedCaseType: "woodland",
    availableCaseTypes: ["frps", "woodland"],
    total: 90,
    phases: [
      {
        code: "PRE_AWARD",
        name: "Pre-award",
        count: 90,
        stages: [
          {
            code: "REVIEW",
            name: "Review application",
            count: 55,
            statuses: [
              {
                code: "IN_PROGRESS",
                name: "In progress",
                theme: "INFO",
                count: 40,
              },
              {
                code: "AWAITING",
                name: "Awaiting info",
                theme: "WARNING",
                count: 15,
              },
            ],
          },
        ],
      },
    ],
    ...overrides,
  },
});

const request = { path: "/reports", url: new URL("http://localhost/reports") };

describe("createReportViewModel", () => {
  it("builds the case-type select with a blank placeholder and the current selection marked", () => {
    const viewModel = createReportViewModel({ page: buildPage(), request });

    expect(viewModel.data.caseTypeItems).toEqual([
      { value: "", text: "Select a case type", selected: false },
      { value: "frps", text: "Frps", selected: false },
      { value: "woodland", text: "Woodland", selected: true },
    ]);
    expect(viewModel.data.selectedCaseTypeLabel).toBe("Woodland");
    expect(viewModel.data.total).toBe(90);
    expect(viewModel.data.hasSelection).toBe(true);
    expect(viewModel.data.hasResults).toBe(true);
  });

  it("selects the blank placeholder and makes no selection on first visit", () => {
    const viewModel = createReportViewModel({
      page: buildPage({ selectedCaseType: null, phases: [], total: 0 }),
      request,
    });

    expect(viewModel.data.caseTypeItems).toEqual([
      { value: "", text: "Select a case type", selected: true },
      { value: "frps", text: "Frps", selected: false },
      { value: "woodland", text: "Woodland", selected: false },
    ]);
    expect(viewModel.data.hasSelection).toBe(false);
    expect(viewModel.data.hasResults).toBe(false);
    expect(viewModel.data.table.rows).toEqual([]);
  });

  it("flattens phases into indented numeric table rows", () => {
    const viewModel = createReportViewModel({ page: buildPage(), request });

    expect(viewModel.data.table.rows).toEqual([
      [
        { text: "Pre-award", classes: "govuk-!-font-weight-bold" },
        { text: "90", format: "numeric", classes: "govuk-!-font-weight-bold" },
      ],
      [
        { text: "Review application", classes: "govuk-!-padding-left-4" },
        { text: "55", format: "numeric", classes: "" },
      ],
      [
        { text: "In progress", classes: "govuk-!-padding-left-8" },
        { text: "40", format: "numeric", classes: "" },
      ],
      [
        { text: "Awaiting info", classes: "govuk-!-padding-left-8" },
        { text: "15", format: "numeric", classes: "" },
      ],
    ]);
  });

  it("reports no results when there are no phases", () => {
    const viewModel = createReportViewModel({
      page: buildPage({ phases: [], total: 0 }),
      request,
    });

    expect(viewModel.data.hasResults).toBe(false);
    expect(viewModel.data.table.rows).toEqual([]);
  });
});

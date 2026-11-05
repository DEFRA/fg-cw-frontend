import { describe, expect, it, vi } from "vitest";
import { createCaseTypeListViewModel } from "./case-type-list.view-model.js";

vi.mock("../../common/view-models/header.view-model.js");

const mockRequest = { path: "/case-types" };

const createMockPage = (caseTypes) => ({
  data: caseTypes,
  header: { navItems: [] },
});

describe("createCaseTypeListViewModel", () => {
  it("maps case types to view model correctly", () => {
    const caseTypes = [{ code: "woodland" }, { code: "frps-private-beta" }];

    const viewModel = createCaseTypeListViewModel({
      page: createMockPage(caseTypes),
      request: mockRequest,
    });

    expect(viewModel.pageTitle).toEqual("Case types");
    expect(viewModel.pageHeading).toEqual("Case types");
    expect(viewModel.breadcrumbs).toEqual([]);
    expect(viewModel.data.caseTypes.head).toEqual([
      { text: "Code" },
      { text: "Name" },
      { text: "Status" },
    ]);
    expect(viewModel.data.caseTypes.rows).toEqual([
      {
        code: {
          text: "woodland",
          href: "/types/woodland/cases",
        },
        name: "[Name]",
        status: "[Status]",
      },
      {
        code: {
          text: "frps-private-beta",
          href: "/types/frps-private-beta/cases",
        },
        name: "[Name]",
        status: "[Status]",
      },
    ]);
  });

  it("handles empty case types list", () => {
    const viewModel = createCaseTypeListViewModel({
      page: createMockPage([]),
      request: mockRequest,
    });
    expect(viewModel.data.caseTypes.rows).toEqual([]);
  });

  it("handles null case types list", () => {
    const viewModel = createCaseTypeListViewModel({
      page: createMockPage(null),
      request: mockRequest,
    });
    expect(viewModel.data.caseTypes.rows).toEqual([]);
  });
});

import { describe, expect, it, vi } from "vitest";
import { findCaseByIdUseCase } from "../../cases/use-cases/find-case-by-id.use-case.js";
import { getComponentsContentUseCase } from "../use-cases/components.use-case.js";
import { createComponentsViewModel } from "../view-models/components.view-model.js";
import { viewComponentsRoute } from "./get-components.route.js";

vi.mock("../../cases/use-cases/find-case-by-id.use-case.js");
vi.mock("../use-cases/components.use-case.js");
vi.mock("../view-models/components.view-model.js");

describe("viewComponentsRoute", () => {
  const createMockPage = (caseData) => ({
    header: { navItems: [] },
    data: caseData,
  });

  it("renders the components preview with the case data and session content", async () => {
    const request = {
      params: { caseId: "case-123" },
      auth: {
        credentials: {
          token: "token-123",
          user: { id: "user-123", name: "Test User" },
        },
      },
      yar: { mock: "session" },
    };

    const viewModel = { pageTitle: "Components" };

    findCaseByIdUseCase.mockResolvedValue(
      createMockPage({ caseId: "case-123" }),
    );
    getComponentsContentUseCase.mockReturnValue([{ id: "component-1" }]);
    createComponentsViewModel.mockReturnValue(viewModel);

    const h = {
      view: vi.fn(),
    };

    await viewComponentsRoute.handler(request, h);

    expect(findCaseByIdUseCase).toHaveBeenCalledWith(
      {
        token: "token-123",
        user: { id: "user-123", name: "Test User" },
      },
      "case-123",
    );
    expect(getComponentsContentUseCase).toHaveBeenCalledWith({
      mock: "session",
    });
    expect(createComponentsViewModel).toHaveBeenCalledWith({
      page: {
        header: {
          navItems: [],
        },
        data: { caseId: "case-123" },
      },
      request,
      content: [{ id: "component-1" }],
    });
    expect(h.view).toHaveBeenCalledWith("temp/components", viewModel);
  });
});

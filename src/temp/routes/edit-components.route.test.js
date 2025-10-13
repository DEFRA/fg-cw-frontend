import { describe, expect, it, vi } from "vitest";
import { findCaseByIdUseCase } from "../../cases/use-cases/find-case-by-id.use-case.js";
import { getComponentsContentUseCase } from "../use-cases/components.use-case.js";
import { createComponentsEditViewModel } from "../view-models/components.view-model.js";
import { editComponentsRoute } from "./edit-components.route.js";

vi.mock("../../cases/use-cases/find-case-by-id.use-case.js");
vi.mock("../use-cases/components.use-case.js");
vi.mock("../view-models/components.view-model.js");

describe("editComponentsRoute", () => {
  it("renders the edit form with the case and session content", async () => {
    const request = {
      params: { caseId: "case-123" },
      auth: {
        credentials: {
          token: "token-123",
          user: { id: "user-123" },
        },
      },
      yar: { mock: "session" },
    };

    findCaseByIdUseCase.mockResolvedValue({ caseId: "case-123" });
    getComponentsContentUseCase.mockReturnValue([{ id: "component-1" }]);
    createComponentsEditViewModel.mockReturnValue({
      pageTitle: "Edit components",
    });

    const h = {
      view: vi.fn(),
    };

    await editComponentsRoute.handler(request, h);

    expect(findCaseByIdUseCase).toHaveBeenCalledWith(
      {
        token: "token-123",
        user: { id: "user-123" },
      },
      "case-123",
    );
    expect(getComponentsContentUseCase).toHaveBeenCalledWith({
      mock: "session",
    });
    expect(createComponentsEditViewModel).toHaveBeenCalledWith(
      { caseId: "case-123" },
      { content: [{ id: "component-1" }] },
    );
    expect(h.view).toHaveBeenCalledWith("temp/components-edit", {
      pageTitle: "Edit components",
    });
  });
});

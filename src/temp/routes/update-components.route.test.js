import { beforeEach, describe, expect, it, vi } from "vitest";
import { findCaseByIdUseCase } from "../../cases/use-cases/find-case-by-id.use-case.js";
import { updateComponentsPreviewUseCase } from "../use-cases/components.use-case.js";
import { createComponentsEditViewModel } from "../view-models/components.view-model.js";
import { updateComponentsRoute } from "./update-components.route.js";

vi.mock("../../cases/use-cases/find-case-by-id.use-case.js");
vi.mock("../use-cases/components.use-case.js");
vi.mock("../view-models/components.view-model.js");

describe("updateComponentsRoute", () => {
  const request = {
    params: { caseId: "case-123" },
    payload: { jsonPayload: '{"id":"component-1"}' },
    auth: {
      credentials: {
        token: "token-123",
        user: { id: "user-123" },
      },
    },
    yar: { mock: "session" },
  };

  const authContext = {
    token: "token-123",
    user: { id: "user-123" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    findCaseByIdUseCase.mockResolvedValue({ caseId: "case-123" });
  });

  it("renders the edit page with validation errors when the payload is invalid", async () => {
    const errors = { jsonPayload: "Enter a JSON payload" };
    updateComponentsPreviewUseCase.mockReturnValue({ errors });
    createComponentsEditViewModel.mockReturnValue({
      pageTitle: "Edit components",
    });

    const h = {
      view: vi.fn(),
      redirect: vi.fn(),
    };

    await updateComponentsRoute.handler(request, h);

    expect(findCaseByIdUseCase).toHaveBeenCalledWith(authContext, "case-123");
    expect(updateComponentsPreviewUseCase).toHaveBeenCalledWith({
      session: { mock: "session" },
      jsonPayload: '{"id":"component-1"}',
    });
    expect(createComponentsEditViewModel).toHaveBeenCalledWith(
      { caseId: "case-123" },
      {
        formData: { jsonPayload: '{"id":"component-1"}' },
        errors,
      },
    );
    expect(h.view).toHaveBeenCalledWith("temp/components-edit", {
      pageTitle: "Edit components",
    });
    expect(h.redirect).not.toHaveBeenCalled();
  });

  it("redirects to the components preview when the payload is valid", async () => {
    updateComponentsPreviewUseCase.mockReturnValue({ content: [] });

    const h = {
      view: vi.fn(),
      redirect: vi.fn().mockReturnValue("redirect"),
    };

    const response = await updateComponentsRoute.handler(request, h);

    expect(findCaseByIdUseCase).toHaveBeenCalledWith(authContext, "case-123");
    expect(updateComponentsPreviewUseCase).toHaveBeenCalledWith({
      session: { mock: "session" },
      jsonPayload: '{"id":"component-1"}',
    });
    expect(createComponentsEditViewModel).not.toHaveBeenCalled();
    expect(h.redirect).toHaveBeenCalledWith("/cases/case-123/components");
    expect(response).toBe("redirect");
  });
});

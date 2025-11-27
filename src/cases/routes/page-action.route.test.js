import { beforeEach, describe, expect, it, vi } from "vitest";
import { triggerPageActionUseCase } from "../use-cases/trigger-page-action.use-case.js";
import { pageActionRoute } from "./page-action.route.js";

vi.mock("../use-cases/trigger-page-action.use-case.js");

describe("pageActionRoute", () => {
  let mockRequest;
  let mockH;

  beforeEach(() => {
    mockRequest = {
      params: {
        caseId: "case-123",
      },
      payload: {
        actionCode: "RECALCULATE_RULES",
        actionName: "Rerun Rules",
      },
      auth: {
        credentials: {
          token: "mock-token",
          user: {
            appRoles: ["caseworker"],
          },
        },
      },
      yar: {
        flash: vi.fn(),
      },
      headers: {
        referer: "/cases/case-123",
      },
    };

    mockH = {
      redirect: vi.fn().mockReturnValue("redirected"),
    };

    vi.clearAllMocks();
  });

  it("should trigger page action successfully", async () => {
    triggerPageActionUseCase.mockResolvedValueOnce();

    const result = await pageActionRoute.handler(mockRequest, mockH);

    expect(triggerPageActionUseCase).toHaveBeenCalledWith(
      {
        token: "mock-token",
        user: {
          appRoles: ["caseworker"],
        },
      },
      {
        caseId: "case-123",
        actionCode: "RECALCULATE_RULES",
      },
    );

    expect(mockRequest.yar.flash).toHaveBeenCalledWith("notification", {
      variant: "success",
      title: "Action completed",
      text: "Rerun Rules completed successfully",
    });

    expect(mockH.redirect).toHaveBeenCalledWith("/cases/case-123");
    expect(result).toBe("redirected");
  });

  it("should handle different action codes", async () => {
    mockRequest.payload.actionCode = "FETCH_RULES";
    mockRequest.payload.actionName = "Fetch Rules";
    triggerPageActionUseCase.mockResolvedValueOnce();

    await pageActionRoute.handler(mockRequest, mockH);

    expect(triggerPageActionUseCase).toHaveBeenCalledWith(
      {
        token: "mock-token",
        user: {
          appRoles: ["caseworker"],
        },
      },
      {
        caseId: "case-123",
        actionCode: "FETCH_RULES",
      },
    );

    expect(mockRequest.yar.flash).toHaveBeenCalledWith("notification", {
      variant: "success",
      title: "Action completed",
      text: "Fetch Rules completed successfully",
    });
  });

  it("should handle use case errors", async () => {
    const error = new Error("External action not found");
    triggerPageActionUseCase.mockRejectedValueOnce(error);

    const result = await pageActionRoute.handler(mockRequest, mockH);

    expect(mockRequest.yar.flash).toHaveBeenCalledWith("notification", {
      variant: "error",
      title: "Action failed",
      text: "There was a problem running this action. Please try again later.",
    });

    expect(mockH.redirect).toHaveBeenCalledWith("/cases/case-123");
    expect(result).toBe("redirected");
  });

  it("should handle use case errors without message", async () => {
    const error = new Error();
    triggerPageActionUseCase.mockRejectedValueOnce(error);

    await pageActionRoute.handler(mockRequest, mockH);

    expect(mockRequest.yar.flash).toHaveBeenCalledWith("notification", {
      variant: "error",
      title: "Action failed",
      text: "There was a problem running this action. Please try again later.",
    });
  });

  it("should redirect to referer when available", async () => {
    mockRequest.headers.referer = "/cases/case-123/tabs/details";
    triggerPageActionUseCase.mockResolvedValueOnce();

    await pageActionRoute.handler(mockRequest, mockH);

    expect(mockH.redirect).toHaveBeenCalledWith("/cases/case-123/tabs/details");
  });

  it("should redirect to case detail when no referer", async () => {
    delete mockRequest.headers.referer;
    triggerPageActionUseCase.mockResolvedValueOnce();

    await pageActionRoute.handler(mockRequest, mockH);

    expect(mockH.redirect).toHaveBeenCalledWith("/cases/case-123");
  });

  it("should use fallback message when actionName is missing on success", async () => {
    delete mockRequest.payload.actionName;
    triggerPageActionUseCase.mockResolvedValueOnce();

    await pageActionRoute.handler(mockRequest, mockH);

    expect(mockRequest.yar.flash).toHaveBeenCalledWith("notification", {
      variant: "success",
      title: "Action completed",
      text: "Action completed successfully",
    });
  });

  it("should use fallback message when actionName is missing on error", async () => {
    delete mockRequest.payload.actionName;
    const error = new Error("Something went wrong");
    triggerPageActionUseCase.mockRejectedValueOnce(error);

    await pageActionRoute.handler(mockRequest, mockH);

    expect(mockRequest.yar.flash).toHaveBeenCalledWith("notification", {
      variant: "error",
      title: "Action failed",
      text: "There was a problem running this action. Please try again later.",
    });
  });
});

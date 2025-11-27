import { describe, expect, it, vi } from "vitest";
import * as caseRepository from "../repositories/case.repository.js";
import { triggerPageActionUseCase } from "./trigger-page-action.use-case.js";

vi.mock("../repositories/case.repository.js");

describe("triggerPageActionUseCase", () => {
  const authContext = { token: "mock-token" };

  it("calls repository with correct parameters", async () => {
    const mockData = {
      caseId: "case-123",
      actionCode: "RECALCULATE_RULES",
    };

    const mockResponse = { res: { statusCode: 200 }, payload: {} };
    caseRepository.triggerPageAction.mockResolvedValueOnce(mockResponse);

    const result = await triggerPageActionUseCase(authContext, mockData);

    expect(caseRepository.triggerPageAction).toHaveBeenCalledWith(
      authContext,
      mockData,
    );
    expect(result).toEqual(mockResponse);
  });

  it("handles different action codes", async () => {
    const mockData = {
      caseId: "case-456",
      actionCode: "FETCH_RULES",
    };

    const mockResponse = { res: { statusCode: 200 }, payload: {} };
    caseRepository.triggerPageAction.mockResolvedValueOnce(mockResponse);

    const result = await triggerPageActionUseCase(authContext, mockData);

    expect(caseRepository.triggerPageAction).toHaveBeenCalledWith(
      authContext,
      mockData,
    );
    expect(result).toEqual(mockResponse);
  });

  it("propagates repository errors", async () => {
    const mockData = {
      caseId: "case-error",
      actionCode: "INVALID_ACTION",
    };

    const repositoryError = new Error("External action not found");
    caseRepository.triggerPageAction.mockRejectedValueOnce(repositoryError);

    await expect(
      triggerPageActionUseCase(authContext, mockData),
    ).rejects.toThrow("External action not found");

    expect(caseRepository.triggerPageAction).toHaveBeenCalledWith(
      authContext,
      mockData,
    );
  });
});

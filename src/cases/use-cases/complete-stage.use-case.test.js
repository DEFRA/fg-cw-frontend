import { describe, expect, test, vi } from "vitest";
import { completeStage } from "../repositories/case.repository.js";
import { completeStageUseCase } from "./complete-stage.use-case.js";

vi.mock("../repositories/case.repository.js");

describe("completeStageUseCase", () => {
  test("returns completed stage when repository succeeds", async () => {
    const caseId = "case-123";
    const mockResult = {
      _id: "case-123",
      clientRef: "client-ref-123",
      code: "case-code-123",
      workflowCode: "workflow-123",
      currentStage: "stage-2",
      stages: ["stage-1", "stage-2"],
      createdAt: "2021-01-01T00:00:00.000Z",
      submittedAt: "2021-01-15T10:30:00.000Z",
      status: "Completed",
      assignedUser: "john doe",
    };

    completeStage.mockResolvedValueOnce(mockResult);

    const result = await completeStageUseCase(caseId);

    expect(completeStage).toHaveBeenCalledOnce();
    expect(completeStage).toHaveBeenCalledWith(caseId);
    expect(result).toEqual(mockResult);
  });

  test("propagates error when repository throws", async () => {
    const caseId = "case-123";
    const error = new Error("Repository failed");

    completeStage.mockRejectedValueOnce(error);

    await expect(completeStageUseCase(caseId)).rejects.toThrow(
      "Repository failed",
    );
    expect(completeStage).toHaveBeenCalledOnce();
    expect(completeStage).toHaveBeenCalledWith(caseId);
  });

  test("calls repository with correct caseId parameter", async () => {
    const caseId = "specific-case-id";
    const mockResult = { _id: caseId, status: "Completed" };

    completeStage.mockResolvedValueOnce(mockResult);

    await completeStageUseCase(caseId);

    expect(completeStage).toHaveBeenCalledWith(caseId);
  });

  test("returns null when repository returns null", async () => {
    const caseId = "non-existent-case";

    completeStage.mockResolvedValueOnce(null);

    const result = await completeStageUseCase(caseId);

    expect(completeStage).toHaveBeenCalledWith(caseId);
    expect(result).toBeNull();
  });
});

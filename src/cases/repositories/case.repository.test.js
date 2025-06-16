import { describe, expect, it, vi } from "vitest";
import {
  completeStage,
  findAll,
  findById,
  updateTaskStatus,
} from "./case.repository.js";

// Mock the wreck dependency
const mockWreck = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock("../../server/common/helpers/wreck.js", () => ({
  wreck: mockWreck,
}));

describe("Case Repository", () => {
  describe("findAll", () => {
    it("returns array of case objects when API call succeeds", async () => {
      mockWreck.get.mockResolvedValueOnce({
        payload: [
          {
            _id: "case-1",
            caseRef: "client-ref-1",
            payload: {
              code: "case-code-1",
              submittedAt: "2021-01-15T10:30:00.000Z",
            },
            workflowCode: "workflow-1",
            currentStage: "stage-1",
            stages: ["stage-1", "stage-2"],
            createdAt: "2021-01-01T00:00:00.000Z",
            status: "In Progress",
            assignedUser: "user-1",
          },
          {
            _id: "case-2",
            caseRef: "client-ref-2",
            workflowCode: "workflow-2",
            currentStage: "stage-2",
            createdAt: "2021-02-01T00:00:00.000Z",
            submittedAt: "2021-02-15T10:30:00.000Z",
            status: "Completed",
            assignedUser: "user-2",
          },
        ],
      });

      const result = await findAll();

      expect(mockWreck.get).toHaveBeenCalledWith("/cases");

      expect(result).toEqual([
        {
          _id: "case-1",
          caseRef: "client-ref-1",
          payload: {
            code: "case-code-1",
            submittedAt: "2021-01-15T10:30:00.000Z",
          },
          workflowCode: "workflow-1",
          currentStage: "stage-1",
          stages: ["stage-1", "stage-2"],
          createdAt: "2021-01-01T00:00:00.000Z",
          status: "In Progress",
          assignedUser: "user-1",
        },
        {
          _id: "case-2",
          caseRef: "client-ref-2",
          workflowCode: "workflow-2",
          currentStage: "stage-2",
          createdAt: "2021-02-01T00:00:00.000Z",
          submittedAt: "2021-02-15T10:30:00.000Z",
          status: "Completed",
          assignedUser: "user-2",
        },
      ]);
    });
  });

  describe("findById", () => {
    it("returns case object when API call succeeds", async () => {
      const caseId = "case-123";
      const mockApiResponse = {
        payload: {
          _id: "case-123",
          caseRef: "client-ref-123",
          payload: {
            code: "case-code-123",
          },
          workflowCode: "workflow-123",
          currentStage: "stage-1",
          stages: ["stage-1"],
          createdAt: "2021-01-01T00:00:00.000Z",
          submittedAt: "2021-01-15T10:30:00.000Z",
          status: "Active",
          assignedUser: "user-123",
        },
      };

      mockWreck.get.mockResolvedValueOnce(mockApiResponse);

      const result = await findById(caseId);

      expect(mockWreck.get).toHaveBeenCalledWith("/cases/case-123");
      expect(result).toEqual({
        _id: "case-123",
        caseRef: "client-ref-123",
        payload: {
          code: "case-code-123",
        },
        workflowCode: "workflow-123",
        currentStage: "stage-1",
        stages: ["stage-1"],
        createdAt: "2021-01-01T00:00:00.000Z",
        submittedAt: "2021-01-15T10:30:00.000Z",
        status: "Active",
        assignedUser: "user-123",
      });
    });

    it("returns null when API returns null payload", async () => {
      const caseId = "nonexistent-case";
      const mockApiResponse = {
        payload: null,
      };

      mockWreck.get.mockResolvedValueOnce(mockApiResponse);

      const result = await findById(caseId);

      expect(mockWreck.get).toHaveBeenCalledWith("/cases/nonexistent-case");
      expect(result).toBeNull();
    });

    it("returns undefined when API returns undefined payload", async () => {
      const caseId = "nonexistent-case";
      const mockApiResponse = {};

      mockWreck.get.mockResolvedValueOnce(mockApiResponse);

      const result = await findById(caseId);

      expect(mockWreck.get).toHaveBeenCalledWith("/cases/nonexistent-case");
      expect(result).toBeUndefined();
    });
  });

  describe("updateTaskStatus", () => {
    it("calls api with payload data", async () => {
      const params = {
        stageId: "stage-1",
        caseId: "1234-0909",
        taskGroupId: "tg-01",
        taskId: "t-01",
      };
      await updateTaskStatus({ ...params, isComplete: true });
      expect(mockWreck.patch).toHaveBeenCalledWith(
        "/cases/1234-0909/stages/stage-1/task-groups/tg-01/tasks/t-01/status",
        { payload: { status: "complete" } },
      );
    });
  });

  describe("completeStage", () => {
    it("returns with undefined when API call succeeds", async () => {
      const caseId = "case-123";
      const mockApiResponse = {
        payload: {
          _id: "case-123",
          caseRef: "client-ref-123",
          payload: {
            code: "case-code-123",
          },
          workflowCode: "workflow-123",
          currentStage: "stage-2",
          stages: ["stage-1", "stage-2"],
          createdAt: "2021-01-01T00:00:00.000Z",
          submittedAt: "2021-01-15T10:30:00.000Z",
          status: "Updated",
          assignedUser: "user-123",
        },
      };

      mockWreck.post.mockResolvedValueOnce(mockApiResponse);

      const result = await completeStage(caseId);

      expect(mockWreck.post).toHaveBeenCalledWith("/cases/case-123/stage");
      expect(result).toBeUndefined();
    });

    it('returns "update failed" on unexpected error', async () => {
      const caseId = "case-123";
      const mockApiResponse = new Error("Error");

      mockWreck.post.mockRejectedValueOnce(mockApiResponse);

      const result = await completeStage(caseId);

      expect(mockWreck.post).toHaveBeenCalledWith("/cases/case-123/stage");
      expect(result).toEqual({ error: "Update failed" });
    });

    it("returns payload error when api throws", async () => {
      const caseId = "case-123";
      const mockApiResponse = {
        data: {
          payload: "All tasks must be complete.",
        },
      };

      mockWreck.post.mockRejectedValueOnce(mockApiResponse);

      const result = await completeStage(caseId);

      expect(mockWreck.post).toHaveBeenCalledWith("/cases/case-123/stage");
      expect(result).toEqual({ error: "All tasks must be complete." });
    });
  });
});

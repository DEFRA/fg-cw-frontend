import { describe, expect, it, vi } from "vitest";
import { wreck } from "../../common/wreck.js";
import {
  addNoteToCase,
  assignUserToCase,
  completeStage,
  findAll,
  findById,
  updateTaskStatus,
} from "./case.repository.js";

vi.mock("../../common/wreck.js");

describe("Case Repository", () => {
  describe("findAll", () => {
    it("returns array of case objects when API call succeeds", async () => {
      wreck.get.mockResolvedValueOnce({
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

      expect(wreck.get).toHaveBeenCalledWith("/cases");

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

      wreck.get.mockResolvedValueOnce(mockApiResponse);

      const result = await findById(caseId);

      expect(wreck.get).toHaveBeenCalledWith("/cases/case-123");
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

      wreck.get.mockResolvedValueOnce(mockApiResponse);

      const result = await findById(caseId);

      expect(wreck.get).toHaveBeenCalledWith("/cases/nonexistent-case");
      expect(result).toBeNull();
    });

    it("returns undefined when API returns undefined payload", async () => {
      const caseId = "nonexistent-case";
      const mockApiResponse = {};

      wreck.get.mockResolvedValueOnce(mockApiResponse);

      const result = await findById(caseId);

      expect(wreck.get).toHaveBeenCalledWith("/cases/nonexistent-case");
      expect(result).toBeUndefined();
    });
  });

  describe("updateTaskStatus", () => {
    it("calls api with payload data", async () => {
      wreck.patch.mockResolvedValueOnce({});
      const params = {
        stageId: "stage-1",
        caseId: "1234-0909",
        taskGroupId: "tg-01",
        taskId: "t-01",
      };
      await updateTaskStatus({ ...params, isComplete: true });
      expect(wreck.patch).toHaveBeenCalledWith(
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

      wreck.post.mockResolvedValueOnce(mockApiResponse);

      const result = await completeStage(caseId);

      expect(wreck.post).toHaveBeenCalledWith("/cases/case-123/stage");
      expect(result).toBeUndefined();
    });
  });

  describe("assignUserToCase", () => {
    it("assigns user to case successfully", async () => {
      const caseId = "case-123";
      const assignedUserId = "user-456";

      wreck.patch.mockResolvedValueOnce({});

      const result = await assignUserToCase({ caseId, assignedUserId });

      expect(wreck.patch).toHaveBeenCalledWith(
        "/cases/case-123/assigned-user",
        {
          payload: { assignedUserId: "user-456" },
        },
      );
      expect(result).toBeUndefined();
    });

    it("unassigns user from case with null assignedUserId", async () => {
      const caseId = "case-789";
      const assignedUserId = null;

      wreck.patch.mockResolvedValueOnce({});

      const result = await assignUserToCase({ caseId, assignedUserId });

      expect(wreck.patch).toHaveBeenCalledWith(
        "/cases/case-789/assigned-user",
        {
          payload: { assignedUserId: null },
        },
      );
      expect(result).toBeUndefined();
    });

    it("handles assignment with empty string assignedUserId", async () => {
      const caseId = "case-999";
      const assignedUserId = "";

      wreck.patch.mockResolvedValueOnce({});

      const result = await assignUserToCase({ caseId, assignedUserId });

      expect(wreck.patch).toHaveBeenCalledWith(
        "/cases/case-999/assigned-user",
        {
          payload: { assignedUserId: "" },
        },
      );
      expect(result).toBeUndefined();
    });

    it("handles API errors during assignment", async () => {
      const caseId = "case-error";
      const assignedUserId = "user-error";
      const apiError = new Error("API Error");

      wreck.patch.mockRejectedValueOnce(apiError);

      await expect(
        assignUserToCase({ caseId, assignedUserId }),
      ).rejects.toThrow("API Error");

      expect(wreck.patch).toHaveBeenCalledWith(
        "/cases/case-error/assigned-user",
        {
          payload: { assignedUserId: "user-error" },
        },
      );
    });
  });

  describe("addNoteToCase", () => {
    it("calls API with correct endpoint and payload", async () => {
      const mockData = {
        caseId: "case-123",
        type: "NOTE_ADDED",
        text: "This is a test note",
      };

      wreck.post.mockResolvedValueOnce({});

      await addNoteToCase(mockData);

      expect(wreck.post).toHaveBeenCalledWith("/cases/case-123/notes", {
        payload: { type: "NOTE_ADDED", text: "This is a test note" },
      });
    });

    it("propagates API errors", async () => {
      const mockData = {
        caseId: "case-error",
        type: "NOTE_ADDED",
        text: "This will fail",
      };

      const apiError = new Error("API Error");
      wreck.post.mockRejectedValueOnce(apiError);

      await expect(addNoteToCase(mockData)).rejects.toThrow("API Error");

      expect(wreck.post).toHaveBeenCalledWith("/cases/case-error/notes", {
        payload: { type: "NOTE_ADDED", text: "This will fail" },
      });
    });
  });
});

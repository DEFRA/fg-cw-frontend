import { describe, expect, it, vi } from "vitest";
import { wreck } from "../../common/wreck.js";
import {
  addNoteToCase,
  assignUserToCase,
  completeStage,
  findAll,
  findById,
  findTabById,
  updateStageOutcome,
  updateTaskStatus,
} from "./case.repository.js";

vi.mock("../../common/wreck.js");

describe("Case Repository", () => {
  const authContext = { token: "mock-token" };

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

      const result = await findAll(authContext);

      expect(wreck.get).toHaveBeenCalledWith("/cases", {
        headers: {
          authorization: `Bearer ${authContext.token}`,
        },
      });

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

      const result = await findById(authContext, caseId);

      expect(wreck.get).toHaveBeenCalledWith("/cases/case-123", {
        headers: {
          authorization: `Bearer ${authContext.token}`,
        },
      });
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

      const result = await findById(authContext, caseId);

      expect(wreck.get).toHaveBeenCalledWith("/cases/nonexistent-case", {
        headers: {
          authorization: `Bearer ${authContext.token}`,
        },
      });
      expect(result).toBeNull();
    });

    it("returns undefined when API returns undefined payload", async () => {
      const caseId = "nonexistent-case";
      const mockApiResponse = {};

      wreck.get.mockResolvedValueOnce(mockApiResponse);

      const result = await findById(authContext, caseId);

      expect(wreck.get).toHaveBeenCalledWith("/cases/nonexistent-case", {
        headers: {
          authorization: `Bearer ${authContext.token}`,
        },
      });
      expect(result).toBeUndefined();
    });
  });

  describe("findTabById", () => {
    it("returns tab data when API call succeeds", async () => {
      const caseId = "case-123";
      const tabId = "caseDetails";
      const mockApiResponse = {
        payload: {
          _id: "case-123",
          caseRef: "client-ref-123",
          tabId: "caseDetails",
          tabData: {
            title: "Case Details",
            sections: [
              {
                title: "Basic Information",
                fields: [
                  { label: "Case Reference", value: "client-ref-123" },
                  { label: "Status", value: "Active" },
                ],
              },
            ],
          },
        },
      };

      wreck.get.mockResolvedValueOnce(mockApiResponse);

      const result = await findTabById(authContext, caseId, tabId);

      expect(wreck.get).toHaveBeenCalledWith(
        "/cases/case-123/tabs/caseDetails",
        {
          headers: {
            authorization: `Bearer ${authContext.token}`,
          },
        },
      );
      expect(result).toEqual({
        _id: "case-123",
        caseRef: "client-ref-123",
        tabId: "caseDetails",
        tabData: {
          title: "Case Details",
          sections: [
            {
              title: "Basic Information",
              fields: [
                { label: "Case Reference", value: "client-ref-123" },
                { label: "Status", value: "Active" },
              ],
            },
          ],
        },
      });
    });

    it("bubbles up API errors", async () => {
      const caseId = "case-error";
      const tabId = "error-tab";
      const apiError = new Error("Tab not found");

      wreck.get.mockRejectedValueOnce(apiError);

      await expect(findTabById(authContext, caseId, tabId)).rejects.toThrow(
        "Tab not found",
      );

      expect(wreck.get).toHaveBeenCalledWith(
        "/cases/case-error/tabs/error-tab",
        {
          headers: {
            authorization: `Bearer ${authContext.token}`,
          },
        },
      );
    });
  });

  describe("updateTaskStatus", () => {
    it("calls api with payload data", async () => {
      wreck.patch.mockResolvedValueOnce({});
      const params = {
        stageCode: "stage-1",
        caseId: "1234-0909",
        taskGroupCode: "tg-01",
        taskCode: "t-01",
      };
      await updateTaskStatus(authContext, { ...params, isComplete: true });
      expect(wreck.patch).toHaveBeenCalledWith(
        "/cases/1234-0909/stages/stage-1/task-groups/tg-01/tasks/t-01/status",
        {
          headers: {
            authorization: `Bearer ${authContext.token}`,
          },
          payload: { status: "complete", comment: null },
        },
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

      const result = await completeStage(authContext, caseId);

      expect(wreck.post).toHaveBeenCalledWith("/cases/case-123/stage", {
        headers: {
          authorization: `Bearer ${authContext.token}`,
        },
      });
      expect(result).toBeUndefined();
    });
  });

  describe("assignUserToCase", () => {
    it("assigns user to case successfully", async () => {
      const caseId = "case-123";
      const assignedUserId = "user-456";

      wreck.patch.mockResolvedValueOnce({});

      const result = await assignUserToCase(authContext, {
        caseId,
        assignedUserId,
      });

      expect(wreck.patch).toHaveBeenCalledWith(
        "/cases/case-123/assigned-user",
        {
          headers: {
            authorization: `Bearer ${authContext.token}`,
          },
          payload: { assignedUserId: "user-456" },
        },
      );
      expect(result).toBeUndefined();
    });

    it("unassigns user from case with null assignedUserId", async () => {
      const caseId = "case-789";
      const assignedUserId = null;

      wreck.patch.mockResolvedValueOnce({});

      const result = await assignUserToCase(authContext, {
        caseId,
        assignedUserId,
      });

      expect(wreck.patch).toHaveBeenCalledWith(
        "/cases/case-789/assigned-user",
        {
          headers: {
            authorization: `Bearer ${authContext.token}`,
          },
          payload: { assignedUserId: null },
        },
      );
      expect(result).toBeUndefined();
    });

    it("handles assignment with empty string assignedUserId", async () => {
      const caseId = "case-999";
      const assignedUserId = "";

      wreck.patch.mockResolvedValueOnce({});

      const result = await assignUserToCase(authContext, {
        caseId,
        assignedUserId,
      });

      expect(wreck.patch).toHaveBeenCalledWith(
        "/cases/case-999/assigned-user",
        {
          headers: {
            authorization: `Bearer ${authContext.token}`,
          },
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
        assignUserToCase(authContext, { caseId, assignedUserId }),
      ).rejects.toThrow("API Error");

      expect(wreck.patch).toHaveBeenCalledWith(
        "/cases/case-error/assigned-user",
        {
          headers: {
            authorization: `Bearer ${authContext.token}`,
          },
          payload: { assignedUserId: "user-error" },
        },
      );
    });
  });

  describe("updateStageOutcome", () => {
    it("calls API with correct endpoint and payload", async () => {
      const mockData = {
        caseId: "case-123",
        actionCode: "approve",
        comment: "This looks good to me",
      };

      wreck.patch.mockResolvedValueOnce({});

      await updateStageOutcome(authContext, mockData);

      expect(wreck.patch).toHaveBeenCalledWith(
        "/cases/case-123/stage/outcome",
        {
          headers: {
            authorization: `Bearer ${authContext.token}`,
          },
          payload: { actionCode: "approve", comment: "This looks good to me" },
        },
      );
    });

    it("handles payload with multiple properties", async () => {
      const mockData = {
        caseId: "case-456",
        actionCode: "reject",
        comment: "Missing required documents",
      };

      wreck.patch.mockResolvedValueOnce({});

      await updateStageOutcome(authContext, mockData);

      expect(wreck.patch).toHaveBeenCalledWith(
        "/cases/case-456/stage/outcome",
        {
          headers: {
            authorization: `Bearer ${authContext.token}`,
          },
          payload: {
            actionCode: "reject",
            comment: "Missing required documents",
          },
        },
      );
    });

    it("handles payload without comment", async () => {
      const mockData = {
        caseId: "case-789",
        actionCode: "approve",
      };

      wreck.patch.mockResolvedValueOnce({});

      await updateStageOutcome(authContext, mockData);

      expect(wreck.patch).toHaveBeenCalledWith(
        "/cases/case-789/stage/outcome",
        {
          headers: {
            authorization: `Bearer ${authContext.token}`,
          },
          payload: { actionCode: "approve" },
        },
      );
    });

    it("propagates API errors", async () => {
      const mockData = {
        caseId: "case-error",
        actionCode: "approve",
        comment: "This will fail",
      };

      const apiError = new Error("Stage outcome update failed");
      wreck.patch.mockRejectedValueOnce(apiError);

      await expect(updateStageOutcome(authContext, mockData)).rejects.toThrow(
        "Stage outcome update failed",
      );

      expect(wreck.patch).toHaveBeenCalledWith(
        "/cases/case-error/stage/outcome",
        {
          headers: {
            authorization: `Bearer ${authContext.token}`,
          },
          payload: { actionCode: "approve", comment: "This will fail" },
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

      await addNoteToCase(authContext, mockData);

      expect(wreck.post).toHaveBeenCalledWith("/cases/case-123/notes", {
        headers: {
          authorization: `Bearer ${authContext.token}`,
        },
        payload: { text: "This is a test note" },
      });
    });

    it("propagates API errors", async () => {
      const mockData = {
        caseId: "case-error",
        text: "This will fail",
      };

      const apiError = new Error("API Error");
      wreck.post.mockRejectedValueOnce(apiError);

      await expect(addNoteToCase(authContext, mockData)).rejects.toThrow(
        "API Error",
      );

      expect(wreck.post).toHaveBeenCalledWith("/cases/case-error/notes", {
        headers: {
          authorization: `Bearer ${authContext.token}`,
        },
        payload: { text: "This will fail" },
      });
    });
  });
});

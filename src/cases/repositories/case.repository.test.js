import { describe, expect, it, vi } from "vitest";
import { wreck } from "../../common/wreck.js";
import { findAll, findById, updateStage } from "./case.repository.js";

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

  describe("updateStage", () => {
    it("returns updated case object when API call succeeds", async () => {
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

      const result = await updateStage(caseId);

      expect(wreck.post).toHaveBeenCalledWith("/cases/case-123/stage");
      expect(result).toEqual({
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
      });
    });

    it("returns null when API returns null payload", async () => {
      const caseId = "case-123";
      const mockApiResponse = {
        payload: null,
      };

      wreck.post.mockResolvedValueOnce(mockApiResponse);

      const result = await updateStage(caseId);

      expect(wreck.post).toHaveBeenCalledWith("/cases/case-123/stage");
      expect(result).toBeNull();
    });

    it("returns undefined when API returns undefined payload", async () => {
      const caseId = "case-123";
      const mockApiResponse = {};

      wreck.post.mockResolvedValueOnce(mockApiResponse);

      const result = await updateStage(caseId);

      expect(wreck.post).toHaveBeenCalledWith("/cases/case-123/stage");
      expect(result).toBeUndefined();
    });
  });
});

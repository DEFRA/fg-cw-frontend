import { describe, expect, test, vi } from "vitest";
import { wreck } from "../../common/wreck.js";
import { findByCode } from "./workflow.repository.js";

vi.mock("../../common/wreck.js");

describe("workflow repository", () => {
  describe("findByCode", () => {
    test("returns workflow data when wreck request succeeds", async () => {
      const workflowCode = "test-workflow-123";
      const mockPayload = {
        code: "test-workflow-123",
        name: "Test Workflow",
        stages: [
          {
            id: "stage-1",
            title: "Initial Stage",
            actions: ["submit", "cancel"],
            taskGroups: [
              {
                id: "taskgroup-1",
                title: "First Task Group",
                tasks: [
                  {
                    id: "task-1",
                    title: "First Task",
                    type: "text",
                  },
                ],
              },
            ],
          },
        ],
      };

      wreck.get.mockResolvedValueOnce({ payload: mockPayload });

      const result = await findByCode(workflowCode);

      expect(wreck.get).toHaveBeenCalledOnce();
      expect(wreck.get).toHaveBeenCalledWith(`/workflows/${workflowCode}`);
      expect(result).toEqual(mockPayload);
    });

    test("returns empty workflow when payload is empty", async () => {
      const workflowCode = "empty-workflow";
      const mockPayload = {
        code: "empty-workflow",
        name: "Empty Workflow",
        stages: [],
      };

      wreck.get.mockResolvedValueOnce({ payload: mockPayload });

      const result = await findByCode(workflowCode);

      expect(result).toEqual(mockPayload);
      expect(result.stages).toEqual([]);
    });

    test("returns null payload when workflow not found", async () => {
      const workflowCode = "non-existent-workflow";
      const mockPayload = null;

      wreck.get.mockResolvedValueOnce({ payload: mockPayload });

      const result = await findByCode(workflowCode);

      expect(result).toBeNull();
    });

    test("handles HTTP 404 error", async () => {
      const workflowCode = "not-found-workflow";
      const error = new Error("Not Found");
      error.output = { statusCode: 404 };

      wreck.get.mockRejectedValueOnce(error);

      await expect(findByCode(workflowCode)).rejects.toThrow("Not Found");
    });

    test("handles HTTP 500 server error", async () => {
      const workflowCode = "server-error-workflow";
      const error = new Error("Internal Server Error");
      error.output = { statusCode: 500 };

      wreck.get.mockRejectedValueOnce(error);

      await expect(findByCode(workflowCode)).rejects.toThrow(
        "Internal Server Error",
      );
    });

    test("calls wreck.get with correct URL format", async () => {
      const workflowCode = "url-test-workflow";
      const mockPayload = { code: workflowCode };

      wreck.get.mockResolvedValueOnce({ payload: mockPayload });

      await findByCode(workflowCode);

      expect(wreck.get).toHaveBeenCalledWith(`/workflows/${workflowCode}`);
      expect(wreck.get).toHaveBeenCalledWith("/workflows/url-test-workflow");
    });

    test("handles undefined payload in response", async () => {
      const workflowCode = "undefined-payload-workflow";

      wreck.get.mockResolvedValueOnce({ payload: undefined });

      const result = await findByCode(workflowCode);

      expect(result).toBeUndefined();
    });
  });
});

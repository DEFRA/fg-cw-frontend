import { describe, expect, test, vi } from "vitest";
import { wreck } from "../../common/wreck.js";
import { findSecretWorkflowUseCase } from "./find-secret-workflow.use-case.js";

vi.mock("../../common/wreck.js");

describe("findSecretWorkflowUseCase", () => {
  test("returns workflow data when repository succeeds", async () => {
    const mockWorkflowData = {
      workflowCode: "TEST_WORKFLOW",
      name: "Test Workflow",
      phases: [
        {
          stages: [
            { code: 1, name: "Stage 1" },
            { code: 2, name: "Stage 2" },
          ],
        },
      ],
    };

    wreck.get.mockResolvedValue({
      payload: mockWorkflowData,
    });

    const authContext = {
      token: "mockAccessToken",
    };
    const workflowCode = "TEST_WORKFLOW";

    const result = await findSecretWorkflowUseCase(authContext, workflowCode);

    expect(wreck.get).toHaveBeenCalledWith(`/secret/workflow/${workflowCode}`, {
      headers: {
        Authorization: `Bearer ${authContext.token}`,
      },
    });

    expect(result).toEqual(mockWorkflowData);
  });
});

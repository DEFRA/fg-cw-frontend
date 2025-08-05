import { describe, expect, test, vi } from "vitest";
import { findById } from "../repositories/case.repository.js";
import { findCaseByIdUseCase } from "./find-case-by-id.use-case.js";

vi.mock("../repositories/case.repository.js");

describe("findCaseByIdUseCase", () => {
  test("returns case when repository succeeds", async () => {
    const caseId = "case-123";
    const mockCase = {
      _id: "121234124",
      caseRef: "PMF-REF-1",
      workflowCode: "pigs-might-fly",
      status: "NEW",
      dateReceived: "2025-03-27T11:34:52Z",
      currentStage: "application-received",
      assignedUser: null,
      payload: {
        clientRef: "PMF-REF-1",
        code: "pigs-might-fly",
        createdAt: "2025-03-27T10:34:52.000Z",
        submittedAt: "2025-03-28T11:30:52.000Z",
        answers: {
          isPigFarmer: true,
          totalPigs: 10,
          whitePigsCount: 2,
          britishLandracePigsCount: 2,
          berkshirePigsCount: 3,
          otherPigsCount: 3,
        },
      },
      stages: [
        {
          id: "application-received",
          taskGroups: [
            {
              id: "review-automated-checks",
              tasks: [
                {
                  id: "review-application-data",
                  status: "pending",
                  title: "Review application data",
                  type: "boolean",
                },
              ],
              title: "Review Automated Checks",
            },
          ],
          title: "Application Received",
          actions: [
            {
              id: "accept",
              label: "Accept",
            },
            {
              id: "reject",
              label: "Reject",
            },
          ],
        },
      ],
      timeline: [],
      requiredRoles: {
        allOf: ["ROLE_RPA_ADMIN"],
        anyOf: ["ROLE_RPA_ADMIN"],
      },
      banner: {
        title: {
          ref: "$.payload.businessName",
          type: "string",
        },
        summary: {
          reference: {
            label: "Reference",
            ref: "$.caseRef",
            type: "string",
          },
          status: {
            label: "Status",
            ref: "$.status",
            type: "string",
          },
          dateReceived: {
            label: "Date Received",
            ref: "$.dateReceived",
            type: "date",
          },
        },
      },
      overrideTabs: [
        {
          id: "caseDetails",
          title: "Application",
          sections: [
            {
              title: "Applicant Details",
              type: "object",
              component: "list",
              fields: [
                {
                  ref: "$.payload.answers.isPigFarmer",
                  type: "boolean",
                  label: "Are you a pig farmer?",
                },
              ],
            },
          ],
        },
      ],
      customTabs: [],
    };

    findById.mockResolvedValueOnce(mockCase);

    const result = await findCaseByIdUseCase(caseId);

    expect(findById).toHaveBeenCalledOnce();
    expect(findById).toHaveBeenCalledWith(caseId);
    expect(result).toEqual(mockCase);
    expect(result.overrideTabs).toBeDefined();
    expect(result.customTabs).toBeDefined();
    expect(result.banner).toBeDefined();
    expect(result.requiredRoles).toBeDefined();
  });

  test("handles case with multiple stages and task groups", async () => {
    const caseId = "case-456";
    const mockCase = {
      _id: "case-456",
      caseRef: "PMF-REF-2",
      workflowCode: "workflow-456",
      status: "IN_PROGRESS",
      currentStage: "assessment",
      stages: [
        {
          id: "application-received",
          taskGroups: [
            {
              id: "taskgroup-1",
              tasks: [{ id: "task-1", status: "completed" }],
              title: "Initial Review",
            },
            {
              id: "taskgroup-2",
              tasks: [{ id: "task-2", status: "pending" }],
              title: "Secondary Review",
            },
          ],
          title: "Application Received",
          actions: [],
        },
        {
          id: "assessment",
          taskGroups: [
            {
              id: "taskgroup-3",
              tasks: [{ id: "task-3", status: "not-started" }],
              title: "Assessment Tasks",
            },
          ],
          title: "Assessment",
          actions: [],
        },
      ],
      overrideTabs: [],
      customTabs: [],
      requiredRoles: {
        allOf: ["ROLE_RPA_ADMIN"],
        anyOf: ["ROLE_RPA_ADMIN"],
      },
    };

    findById.mockResolvedValueOnce(mockCase);

    const result = await findCaseByIdUseCase(caseId);

    expect(findById).toHaveBeenCalledWith(caseId);
    expect(result).toEqual(mockCase);
    expect(result.stages).toHaveLength(2);
    expect(result.stages[0].taskGroups).toHaveLength(2);
    expect(result.stages[1].taskGroups).toHaveLength(1);
    expect(result.overrideTabs).toEqual([]);
    expect(result.customTabs).toEqual([]);
  });

  test("propagates error when case repository throws", async () => {
    const caseId = "case-123";
    const error = new Error("Case repository failed");

    findById.mockRejectedValueOnce(error);

    await expect(findCaseByIdUseCase(caseId)).rejects.toThrow(
      "Case repository failed",
    );
    expect(findById).toHaveBeenCalledOnce();
    expect(findById).toHaveBeenCalledWith(caseId);
  });

  test("handles case with empty stages", async () => {
    const caseId = "case-empty";
    const mockCase = {
      _id: "case-empty",
      caseRef: "EMPTY-REF",
      workflowCode: "workflow-empty",
      status: "NEW",
      currentStage: "initial",
      stages: [],
      overrideTabs: [],
      customTabs: [],
      requiredRoles: {
        allOf: ["ROLE_RPA_ADMIN"],
        anyOf: ["ROLE_RPA_ADMIN"],
      },
    };

    findById.mockResolvedValueOnce(mockCase);

    const result = await findCaseByIdUseCase(caseId);

    expect(result.stages).toEqual([]);
    expect(result.overrideTabs).toEqual([]);
    expect(result.customTabs).toEqual([]);
    expect(findById).toHaveBeenCalledWith(caseId);
  });

  test("calls repository with correct parameters", async () => {
    const caseId = "specific-case-id";
    const mockCase = {
      _id: caseId,
      caseRef: "SPECIFIC-REF",
      workflowCode: "specific-workflow-code",
      status: "NEW",
      currentStage: "initial",
      stages: [],
      overrideTabs: [
        {
          id: "tasks",
          title: "Tasks",
        },
      ],
      customTabs: [],
      requiredRoles: {
        allOf: ["ROLE_RPA_ADMIN"],
        anyOf: ["ROLE_RPA_ADMIN"],
      },
    };

    findById.mockResolvedValueOnce(mockCase);

    const result = await findCaseByIdUseCase(caseId);

    expect(findById).toHaveBeenCalledWith(caseId);
    expect(result).toEqual(mockCase);
    expect(result.overrideTabs).toHaveLength(1);
    expect(result.overrideTabs[0].id).toBe("tasks");
  });
});

import { describe, expect, it } from "vitest";
import { createMockLinks } from "../../../test/data/case-test-data.js";
import { createTaskListViewModel } from "./task-list.view-model.js";

describe("createTaskListViewModel", () => {
  const mockCaseData = {
    _id: "case-123",
    caseRef: "CLIENT-REF-001",
    workflowCode: "CASE-CODE-001",
    status: "In Progress",
    dateReceived: "2021-01-10T00:00:00.000Z",
    assignedUser: "john doe",
    banner: { type: "info", message: "Test banner" },
    currentStage: "application-review",
    links: createMockLinks("case-123"),
    payload: {
      submittedAt: "2021-01-15T00:00:00.000Z",
      identifiers: {
        sbi: "123456789",
      },
      answers: {
        scheme: "Test Scheme",
      },
    },
    stages: [
      {
        id: "application-review",
        title: "Application Review",
        actionTitle: "Review Decision",
        taskGroups: [
          {
            id: "review-tasks",
            title: "Review Tasks",
            tasks: [
              {
                id: "task-1",
                title: "Initial Review",
                status: "complete",
              },
              {
                id: "task-2",
                title: "Secondary Review",
                status: "pending",
              },
            ],
          },
        ],
        actions: [
          {
            id: "approve",
            label: "Approve",
            comment: {
              label: "Approval reason",
              helpText: "Please provide a reason",
              type: "REQUIRED",
            },
          },
          {
            id: "reject",
            label: "Reject",
          },
        ],
        outcome: {
          actionId: "approve",
          comment: "Previous approval comment",
        },
      },
    ],
  };

  describe("basic view model creation", () => {
    it("creates view model with all required properties", () => {
      const result = createTaskListViewModel(mockCaseData);

      expect(result.pageTitle).toBe("Case tasks - Application Review");
      expect(result.pageHeading).toBe("Case");
      expect(result.breadcrumbs).toEqual([
        { text: "Cases", href: "/cases" },
        { text: "CLIENT-REF-001" },
      ]);
      expect(result.errors).toEqual({});
      expect(result.errorList).toEqual([]);
      expect(result.values).toEqual({});
    });

    it("transforms case data correctly", () => {
      const result = createTaskListViewModel(mockCaseData);

      expect(result.data.case).toEqual({
        id: "case-123",
        caseRef: "CLIENT-REF-001",
        code: "CASE-CODE-001",
        submittedAt: expect.any(String), // Real formatted date
        status: "In Progress",
        sbi: "123456789",
        scheme: "Test Scheme",
        dateReceived: "2021-01-10T00:00:00.000Z",
        assignedUser: "john doe",
        link: "/cases/case-123",
        stages: mockCaseData.stages,
        currentStage: "application-review",
        banner: expect.any(Object), // Real resolved banner paths
      });
    });

    it("includes stage data", () => {
      const result = createTaskListViewModel(mockCaseData);

      expect(result.data.stage.id).toBe("application-review");
      expect(result.data.stage.title).toBe("Application Review");
      expect(result.data.stage.saveDisabled).toBe(true); // Because task-2 is not complete
    });
  });

  describe("task group mapping", () => {
    it("maps task groups with correct task properties", () => {
      const result = createTaskListViewModel(mockCaseData);
      const mappedTaskGroups = result.data.stage.taskGroups;

      expect(mappedTaskGroups).toHaveLength(1);
      expect(mappedTaskGroups[0]).toEqual({
        id: "review-tasks",
        title: "Review Tasks",
        tasks: [
          {
            id: "task-1",
            title: "Initial Review",
            status: "COMPLETE",
            link: "/cases/case-123/tasks/review-tasks/task-1",
            isComplete: true,
          },
          {
            id: "task-2",
            title: "Secondary Review",
            status: "INCOMPLETE",
            link: "/cases/case-123/tasks/review-tasks/task-2",
            isComplete: false,
          },
        ],
      });
    });

    it("handles empty task groups", () => {
      const caseWithNoTasks = {
        ...mockCaseData,
        stages: [
          {
            ...mockCaseData.stages[0],
            taskGroups: [],
          },
        ],
      };

      const result = createTaskListViewModel(caseWithNoTasks);

      expect(result.data.stage.taskGroups).toEqual([]);
      expect(result.data.stage.saveDisabled).toBe(false); // No tasks = all complete
    });
  });

  describe("save disabled logic", () => {
    it("sets saveDisabled to false when all tasks are complete", () => {
      const allCompleteCase = {
        ...mockCaseData,
        stages: [
          {
            ...mockCaseData.stages[0],
            taskGroups: [
              {
                id: "review-tasks",
                tasks: [
                  { id: "task-1", status: "complete" },
                  { id: "task-2", status: "complete" },
                ],
              },
            ],
          },
        ],
      };

      const result = createTaskListViewModel(allCompleteCase);

      expect(result.data.stage.saveDisabled).toBe(false);
    });

    it("sets saveDisabled to true when any task is incomplete", () => {
      const result = createTaskListViewModel(mockCaseData);

      expect(result.data.stage.saveDisabled).toBe(true);
    });

    it("handles multiple task groups correctly", () => {
      const multipleTaskGroupsCase = {
        ...mockCaseData,
        stages: [
          {
            ...mockCaseData.stages[0],
            taskGroups: [
              {
                id: "group-1",
                tasks: [{ id: "task-1", status: "complete" }],
              },
              {
                id: "group-2",
                tasks: [
                  { id: "task-2", status: "complete" },
                  { id: "task-3", status: "pending" },
                ],
              },
            ],
          },
        ],
      };

      const result = createTaskListViewModel(multipleTaskGroupsCase);

      expect(result.data.stage.saveDisabled).toBe(true); // task-3 is pending
    });
  });

  describe("action mapping", () => {
    it("maps actions with correct properties", () => {
      const result = createTaskListViewModel(mockCaseData);
      const actions = result.data.stage.actions;

      expect(actions.idPrefix).toBe("actionId");
      expect(actions.name).toBe("actionId");
      expect(actions.legend).toBe("Review Decision");
      expect(actions.errorMessage).toBeUndefined();
      expect(actions.items).toHaveLength(2);
    });

    it("maps action items correctly", () => {
      const result = createTaskListViewModel(mockCaseData);
      const [approveItem, rejectItem] = result.data.stage.actions.items;

      expect(approveItem).toEqual({
        value: "approve",
        text: "Approve",
        checked: true, // Because stage.outcome.actionId === "approve"
        conditional: expect.objectContaining({
          id: "approve-comment",
          name: "approve-comment",
          value: "Previous approval comment",
        }),
      });

      expect(rejectItem).toEqual({
        value: "reject",
        text: "Reject",
        checked: false,
        conditional: undefined,
      });
    });

    it("uses default legend when actionTitle is missing", () => {
      const caseWithoutActionTitle = {
        ...mockCaseData,
        stages: [
          {
            ...mockCaseData.stages[0],
            actionTitle: undefined,
          },
        ],
      };

      const result = createTaskListViewModel(caseWithoutActionTitle);

      expect(result.data.stage.actions.legend).toBe("Decision");
    });

    it("handles stages with no actions", () => {
      const caseWithoutActions = {
        ...mockCaseData,
        stages: [
          {
            ...mockCaseData.stages[0],
            actions: [],
          },
        ],
      };

      const result = createTaskListViewModel(caseWithoutActions);

      expect(result.data.stage.actions.items).toEqual([]);
    });
  });

  describe("action checking logic", () => {
    it("checks action based on form values when provided", () => {
      const values = { actionId: "reject" };
      const result = createTaskListViewModel(mockCaseData, {}, values);

      const approveItem = result.data.stage.actions.items.find(
        (item) => item.value === "approve",
      );
      const rejectItem = result.data.stage.actions.items.find(
        (item) => item.value === "reject",
      );

      expect(approveItem.checked).toBe(false);
      expect(rejectItem.checked).toBe(true);
    });

    it("checks action based on stage outcome when no form values", () => {
      const result = createTaskListViewModel(mockCaseData);

      const approveItem = result.data.stage.actions.items.find(
        (item) => item.value === "approve",
      );
      const rejectItem = result.data.stage.actions.items.find(
        (item) => item.value === "reject",
      );

      expect(approveItem.checked).toBe(true); // stage.outcome.actionId === "approve"
      expect(rejectItem.checked).toBe(false);
    });

    it("handles no form values and no stage outcome", () => {
      const caseWithoutOutcome = {
        ...mockCaseData,
        stages: [
          {
            ...mockCaseData.stages[0],
            outcome: undefined,
          },
        ],
      };

      const result = createTaskListViewModel(caseWithoutOutcome);

      result.data.stage.actions.items.forEach((item) => {
        expect(item.checked).toBe(false);
      });
    });
  });

  describe("conditional textarea creation", () => {
    it("creates conditional textarea for actions with comments", () => {
      const result = createTaskListViewModel(mockCaseData);
      const approveItem = result.data.stage.actions.items.find(
        (item) => item.value === "approve",
      );

      expect(approveItem.conditional).toEqual({
        id: "approve-comment",
        name: "approve-comment",
        value: "Previous approval comment", // From stage.outcome.comment
        label: { text: "Approval reason" },
        hint: { text: "Please provide a reason" },
        required: true,
        errorMessage: undefined,
        rows: 3,
      });
    });

    it("does not create conditional textarea for actions without comments", () => {
      const result = createTaskListViewModel(mockCaseData);
      const rejectItem = result.data.stage.actions.items.find(
        (item) => item.value === "reject",
      );

      expect(rejectItem.conditional).toBeUndefined();
    });

    it("uses preserved form values for textarea", () => {
      const values = { "approve-comment": "New comment from form" };
      const result = createTaskListViewModel(mockCaseData, {}, values);
      const approveItem = result.data.stage.actions.items.find(
        (item) => item.value === "approve",
      );

      expect(approveItem.conditional.value).toBe("New comment from form");
    });

    it("includes error messages in textarea", () => {
      const errors = { "approve-comment": { text: "Comment is required" } };
      const result = createTaskListViewModel(mockCaseData, errors);
      const approveItem = result.data.stage.actions.items.find(
        (item) => item.value === "approve",
      );

      expect(approveItem.conditional.errorMessage).toEqual({
        text: "Comment is required",
      });
    });

    it("handles textarea without help text", () => {
      const caseWithoutHelpText = {
        ...mockCaseData,
        stages: [
          {
            ...mockCaseData.stages[0],
            actions: [
              {
                id: "approve",
                label: "Approve",
                comment: {
                  label: "Approval reason",
                  type: "REQUIRED",
                },
              },
            ],
          },
        ],
      };

      const result = createTaskListViewModel(caseWithoutHelpText);
      const approveItem = result.data.stage.actions.items[0];

      expect(approveItem.conditional.hint).toBeUndefined();
    });

    it("handles optional comment types", () => {
      const caseWithOptionalComment = {
        ...mockCaseData,
        stages: [
          {
            ...mockCaseData.stages[0],
            actions: [
              {
                id: "hold",
                label: "Put on Hold",
                comment: {
                  label: "Hold reason",
                  type: "OPTIONAL",
                },
              },
            ],
          },
        ],
      };

      const result = createTaskListViewModel(caseWithOptionalComment);
      const holdItem = result.data.stage.actions.items[0];

      expect(holdItem.conditional.required).toBe(false);
    });
  });

  describe("textarea value priority", () => {
    it("prioritizes form values over stage outcome", () => {
      const values = { "approve-comment": "Form value" };
      const result = createTaskListViewModel(mockCaseData, {}, values);
      const approveItem = result.data.stage.actions.items.find(
        (item) => item.value === "approve",
      );

      expect(approveItem.conditional.value).toBe("Form value");
    });

    it("uses stage outcome when no form value", () => {
      const result = createTaskListViewModel(mockCaseData);
      const approveItem = result.data.stage.actions.items.find(
        (item) => item.value === "approve",
      );

      expect(approveItem.conditional.value).toBe("Previous approval comment");
    });

    it("uses empty string when no form value and no stage outcome", () => {
      const caseWithoutOutcome = {
        ...mockCaseData,
        stages: [
          {
            ...mockCaseData.stages[0],
            outcome: undefined,
          },
        ],
      };

      const result = createTaskListViewModel(caseWithoutOutcome);
      const approveItem = result.data.stage.actions.items.find(
        (item) => item.value === "approve",
      );

      expect(approveItem.conditional.value).toBe("");
    });

    it("uses empty string when stage outcome has different actionId", () => {
      const caseWithDifferentOutcome = {
        ...mockCaseData,
        stages: [
          {
            ...mockCaseData.stages[0],
            outcome: {
              actionId: "reject",
              comment: "Previous rejection comment",
            },
          },
        ],
      };

      const result = createTaskListViewModel(caseWithDifferentOutcome);
      const approveItem = result.data.stage.actions.items.find(
        (item) => item.value === "approve",
      );

      expect(approveItem.conditional.value).toBe("");
    });
  });

  describe("error handling", () => {
    it("includes errors in view model", () => {
      const errors = {
        actionId: { text: "Please select an action" },
        "approve-comment": { text: "Comment is required" },
      };

      const result = createTaskListViewModel(mockCaseData, errors);

      expect(result.errors).toEqual(errors);
      expect(result.errorList).toEqual([
        { text: "Please select an action" },
        { text: "Comment is required" },
      ]);
      expect(result.data.stage.actions.errorMessage).toEqual({
        text: "Please select an action",
      });
    });

    it("handles empty errors object", () => {
      const result = createTaskListViewModel(mockCaseData, {});

      expect(result.errors).toEqual({});
      expect(result.errorList).toEqual([]);
      expect(result.data.stage.actions.errorMessage).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("handles missing identifiers in payload", () => {
      const caseWithoutIdentifiers = {
        ...mockCaseData,
        payload: {
          ...mockCaseData.payload,
          identifiers: undefined,
        },
      };

      const result = createTaskListViewModel(caseWithoutIdentifiers);

      expect(result.data.case.sbi).toBeUndefined();
    });

    it("handles missing answers in payload", () => {
      const caseWithoutAnswers = {
        ...mockCaseData,
        payload: {
          ...mockCaseData.payload,
          answers: undefined,
        },
      };

      const result = createTaskListViewModel(caseWithoutAnswers);

      expect(result.data.case.scheme).toBeUndefined();
    });

    it("handles actions array being undefined", () => {
      const caseWithUndefinedActions = {
        ...mockCaseData,
        stages: [
          {
            ...mockCaseData.stages[0],
            actions: undefined,
          },
        ],
      };

      const result = createTaskListViewModel(caseWithUndefinedActions);

      expect(result.data.stage.actions.items).toEqual([]);
    });
  });
});

import { describe, expect, it } from "vitest";
import { createMockLinks } from "../../../test/data/case-test-data.js";
import { createTaskListViewModel } from "./task-list.view-model.js";

describe("createTaskListViewModel", () => {
  const mockCaseData = {
    _id: "case-123",
    caseRef: "CLIENT-REF-001",
    workflowCode: "CASE-CODE-001",
    dateReceived: "2021-01-10T00:00:00.000Z",
    assignedUser: "john doe",
    banner: { type: "info", message: "Test banner" },
    currentStatus: "In Progress",
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
    stage: {
      code: "application-review",
      name: "Application Review",
      actionTitle: "Review Decision",
      taskGroups: [
        {
          code: "review-tasks",
          name: "Review Tasks",
          tasks: [
            {
              code: "task-1",
              title: "Initial Review",
              status: "complete",
              completed: true,
            },
            {
              code: "task-2",
              title: "Secondary Review",
              status: "pending",
              completed: false,
            },
          ],
        },
      ],
      actions: [
        {
          code: "approve",
          name: "Approve",
          comment: {
            label: "Approval reason",
            helpText: "Please provide a reason",
            mandatory: true,
          },
        },
        {
          code: "reject",
          name: "Reject",
        },
      ],
      outcome: {
        actionCode: "approve",
        comment: "Previous approval comment",
      },
    },
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

      expect(result.data.case).toEqual(mockCaseData);
    });

    it("includes stage data", () => {
      const result = createTaskListViewModel(mockCaseData);

      expect(result.data.stage.code).toBe("application-review");
      expect(result.data.stage.name).toBe("Application Review");
    });
  });

  describe("task group mapping", () => {
    it("maps task groups with correct task properties", () => {
      const result = createTaskListViewModel(mockCaseData);
      const mappedTaskGroups = result.data.stage.taskGroups;

      expect(mappedTaskGroups).toHaveLength(1);
      expect(mappedTaskGroups[0]).toEqual({
        code: "review-tasks",
        name: "Review Tasks",
        tasks: [
          {
            code: "task-1",
            title: "Initial Review",
            status: "COMPLETE",
            completed: true,
            link: "/cases/case-123/tasks/review-tasks/task-1",
            isComplete: true,
          },
          {
            code: "task-2",
            title: "Secondary Review",
            status: "INCOMPLETE",
            completed: false,
            link: "/cases/case-123/tasks/review-tasks/task-2",
            isComplete: false,
          },
        ],
      });
    });

    it("handles empty task groups", () => {
      const kase = structuredClone(mockCaseData);

      kase.stage.taskGroups = [];

      const result = createTaskListViewModel(kase);

      expect(result.data.stage.taskGroups).toEqual([]);
    });
  });

  describe("action mapping", () => {
    it("maps actions with correct properties", () => {
      const result = createTaskListViewModel(mockCaseData);
      const actions = result.data.stage.actions;

      expect(actions.idPrefix).toBe("actionCode");
      expect(actions.name).toBe("actionCode");
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
        checked: true, // Because stage.outcome.actionCode === "approve"
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
      const kase = structuredClone(mockCaseData);

      kase.stage.actionTitle = undefined;

      const result = createTaskListViewModel(kase);

      expect(result.data.stage.actions.legend).toBe("Decision");
    });

    it("handles stages with no actions", () => {
      const kase = structuredClone(mockCaseData);

      kase.stage.actions = [];

      const result = createTaskListViewModel(kase);

      expect(result.data.stage.actions.items).toEqual([]);
    });
  });

  describe("action checking logic", () => {
    it("checks action based on form values when provided", () => {
      const values = { actionCode: "reject" };
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

      expect(approveItem.checked).toBe(true); // stage.outcome.actionCode === "approve"
      expect(rejectItem.checked).toBe(false);
    });

    it("handles no form values and no stage outcome", () => {
      const kase = structuredClone(mockCaseData);

      kase.stage.outcome = undefined;

      const result = createTaskListViewModel(kase);

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
      const kase = structuredClone(mockCaseData);

      kase.stage.actions = [
        {
          code: "approve",
          name: "Approve",
          comment: {
            label: "Approval reason",
            mandatory: true,
          },
        },
      ];

      const result = createTaskListViewModel(kase);
      const approveItem = result.data.stage.actions.items[0];

      expect(approveItem.conditional.hint).toBeUndefined();
    });

    it("handles optional comment types", () => {
      const kase = structuredClone(mockCaseData);

      kase.stage.actions = [
        {
          code: "hold",
          name: "Put on Hold",
          comment: {
            label: "Hold reason",
            mandatory: false,
          },
        },
      ];

      const result = createTaskListViewModel(kase);
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
      const kase = structuredClone(mockCaseData);

      kase.stage.outcome = undefined;

      const result = createTaskListViewModel(kase);
      const approveItem = result.data.stage.actions.items.find(
        (item) => item.value === "approve",
      );

      expect(approveItem.conditional.value).toBe("");
    });

    it("uses empty string when stage outcome has different actionCode", () => {
      const kase = structuredClone(mockCaseData);

      kase.stage.outcome = {
        actionCode: "reject",
        comment: "Previous rejection comment",
      };

      const result = createTaskListViewModel(kase);
      const approveItem = result.data.stage.actions.items.find(
        (item) => item.value === "approve",
      );

      expect(approveItem.conditional.value).toBe("");
    });
  });

  describe("error handling", () => {
    it("includes errors in view model", () => {
      const errors = {
        actionCode: { text: "Please select an action" },
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
  });
});

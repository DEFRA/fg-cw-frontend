import { describe, expect, it, vi } from "vitest";
import {
  createTaskDetailViewModel,
  mapInput,
  mapOptions,
} from "./task-detail.view-model.js";

vi.mock("../../common/helpers/date-helpers.js", () => ({
  getFormattedGBDate: vi.fn((date) => `formatted-${date}`),
}));

vi.mock("../../common/helpers/navigation-helpers.js", () => ({
  setActiveLink: vi.fn((links, activeId) =>
    links.map((link) => ({ ...link, active: link.id === activeId })),
  ),
}));

vi.mock("../../common/view-models/header.view-model.js");

describe("mapInput", () => {
  const map = (input, value = null, error = undefined) =>
    mapInput({ input, value, error });

  it("returns undefined for an option task", () => {
    expect(map(undefined)).toBeUndefined();
  });

  it("maps a text input with its constraints", () => {
    expect(
      map({
        type: "text",
        label: "Siti/FC reference",
        hint: ["For example, SF123456"],
        pattern: "[A-Z]{2}[0-9]{6}",
        maxlength: 20,
      }),
    ).toEqual({
      id: "value",
      name: "value",
      type: "text",
      value: "",
      label: { text: "Siti/FC reference" },
      hint: { text: "For example, SF123456" },
      errorMessage: undefined,
      pattern: "[A-Z]{2}[0-9]{6}",
      attributes: { maxlength: 20 },
    });
  });

  it("maps a number input to a text field with a numeric inputmode", () => {
    expect(
      map({ type: "number", label: "Herd size", min: 1, max: 5000 }),
    ).toEqual({
      id: "value",
      name: "value",
      type: "text",
      inputmode: "numeric",
      value: "",
      label: { text: "Herd size" },
      hint: undefined,
      errorMessage: undefined,
      attributes: { min: 1, max: 5000 },
    });
  });

  it("maps a date input", () => {
    expect(map({ type: "date", label: "Date of last inspection" })).toEqual({
      id: "value",
      name: "value",
      type: "date",
      value: "",
      label: { text: "Date of last inspection" },
      hint: undefined,
      errorMessage: undefined,
      attributes: {},
    });
  });

  it("omits constraints that are not set", () => {
    const result = map({ type: "text", label: "Reference" });

    expect(result.attributes).toEqual({});
    expect(result).not.toHaveProperty("pattern");
  });

  it("joins a multi-line hint into one string", () => {
    expect(
      map({ type: "text", label: "Reference", hint: ["First line", "Second"] })
        .hint,
    ).toEqual({ text: "First line Second" });
  });

  it("renders a saved value back into the field", () => {
    expect(map({ type: "text", label: "Reference" }, "SF123456").value).toBe(
      "SF123456",
    );
  });

  it("renders an empty string rather than null for a cleared value", () => {
    expect(map({ type: "text", label: "Reference" }, null).value).toBe("");
  });

  it("attaches the field error", () => {
    const error = { text: "Enter Reference" };

    expect(
      map({ type: "text", label: "Reference" }, null, error).errorMessage,
    ).toBe(error);
  });
});

describe("mapOptions", () => {
  it("should use valueOption comment if it is defined", () => {
    const result = mapOptions({
      options: [
        {
          code: "complete",
          name: "Complete",
          commentInputDef: {
            label: "Option-specific comment",
            helpText: "Option-specific help text",
            mandatory: true,
          },
        },
      ],
      currentValue: "complete",
      commentInputDef: {
        label: "Default comment",
        helpText: "Default help text",
        mandatory: false,
      },
      currentTaskComment: null,
      formData: {},
      errors: {},
    });

    expect(result[0].conditional).toMatchObject({
      label: { text: "Option-specific comment" },
      hint: { text: "Option-specific help text" },
      required: true,
    });
  });

  it("should fallback to commentInputDef when option comment is not defined", () => {
    const result = mapOptions({
      options: [{ code: "complete", name: "Complete" }],
      currentValue: "complete",
      commentInputDef: {
        label: "Default comment",
        helpText: "Default help text",
        mandatory: false,
      },
      currentTaskComment: null,
      formData: {},
      errors: {},
    });

    expect(result[0].conditional).toMatchObject({
      label: { text: "Default comment" },
      hint: { text: "Default help text" },
      required: false,
    });
  });

  it("should apply comment definitions per value option", () => {
    const result = mapOptions({
      options: [
        {
          code: "approved",
          name: "Approved",
          commentInputDef: {
            label: "Approval notes",
            helpText: "Explain why approved",
            mandatory: true,
          },
        },
        { code: "rejected", name: "Rejected" },
      ],
      currentValue: "approved",
      commentInputDef: {
        label: "General comment",
        helpText: "Optional details",
        mandatory: false,
      },
      currentTaskComment: null,
      formData: {},
      errors: {},
    });

    const approvedOption = result.find((option) => option.value === "approved");
    const rejectedOption = result.find((option) => option.value === "rejected");

    expect(approvedOption.conditional).toMatchObject({
      label: { text: "Approval notes" },
      hint: { text: "Explain why approved" },
      required: true,
    });
    expect(rejectedOption.conditional).toMatchObject({
      label: { text: "General comment" },
      hint: { text: "Optional details" },
      required: false,
    });
  });
});

describe("createTaskDetailViewModel", () => {
  const mockRequest = { path: "/cases/case123/tasks/group1/task1" };

  const createMockPage = (caseData) => ({
    data: caseData,
    header: { navItems: [] },
  });

  const mockCaseData = {
    _id: "case123",
    caseRef: "REF123",
    workflowCode: "workflow1",
    currentPhase: "phase1",
    currentStage: "stage1",
    currentStatus: "active",
    dateReceived: "2024-01-01",
    assignedUser: "user123",
    banner: { type: "info", message: "Test banner" },
    links: [
      { id: "tasks", text: "Tasks", href: "/tasks" },
      { id: "details", text: "Details", href: "/details" },
    ],
    payload: {
      submittedAt: "2024-01-01T10:00:00Z",
      identifiers: { sbi: "SBI123" },
      answers: { scheme: "Test Scheme" },
    },
    stage: {
      code: "stage1",
      taskGroups: [
        {
          code: "group1",
          tasks: [
            {
              code: "task1",
              value: "complete",
              commentRefs: [{ value: "complete", ref: "comment1" }],
              requiredRoles: { allOf: ["role1"], anyOf: [] },
              canComplete: true,
            },
          ],
        },
      ],
    },
    comments: [{ ref: "comment1", text: "Test comment" }],
  };

  const mockQuery = {
    taskGroupCode: "group1",
    taskCode: "task1",
  };

  const mockErrors = { field1: "Error message" };

  it("should create a complete view model", () => {
    const result = createTaskDetailViewModel({
      page: createMockPage(mockCaseData),
      request: mockRequest,
      query: mockQuery,
      errors: mockErrors,
    });

    expect(result).toHaveProperty("errorList", ["Error message"]);
    expect(result).toHaveProperty("pageTitle", "Case task");
    expect(result).toHaveProperty("pageHeading", "Case");

    expect(result.breadcrumbs).toEqual([
      { text: "Cases", href: "/cases" },
      { text: "REF123", href: "/cases/case123" },
    ]);

    expect(result.data).toHaveProperty("banner", mockCaseData.banner);
    expect(result.data).toHaveProperty("caseId", "case123");
    expect(result.data).toHaveProperty("currentTask");
  });

  it("should format case data correctly", () => {
    const result = createTaskDetailViewModel({
      page: createMockPage(mockCaseData),
      request: mockRequest,
      query: mockQuery,
      errors: mockErrors,
    });

    expect(result.data.caseId).toEqual("case123");
    expect(result.data.banner).toEqual(mockCaseData.banner);
  });

  it("should format current task correctly for complete task", () => {
    const result = createTaskDetailViewModel({
      page: createMockPage(mockCaseData),
      request: mockRequest,
      query: mockQuery,
      errors: mockErrors,
    });

    expect(result.data.currentTask).toMatchObject({
      value: "complete",
      canComplete: true,
      formAction: "/cases/case123/task-groups/group1/tasks/task1/value",
    });
  });

  it("should format current task correctly for incomplete task", () => {
    const incompleteCaseData = structuredClone(mockCaseData);

    incompleteCaseData.stage.taskGroups[0].tasks[0].value = "incomplete";

    const result = createTaskDetailViewModel({
      page: createMockPage(incompleteCaseData),
      request: mockRequest,
      query: mockQuery,
      errors: mockErrors,
    });

    expect(result.data.currentTask).toMatchObject({
      value: "incomplete",
    });
  });

  it("should handle missing comment", () => {
    const caseDataNoComment = structuredClone(mockCaseData);

    caseDataNoComment.comments = [];
    caseDataNoComment.stage.taskGroups[0].tasks[0].commentRefs = [
      { value: "complete", ref: "nonexistent" },
    ];

    const result = createTaskDetailViewModel({
      page: createMockPage(caseDataNoComment),
      request: mockRequest,
      query: mockQuery,
      errors: mockErrors,
    });

    expect(result.data.currentTask.comment).toBeNull();
  });

  it("should handle missing payload identifiers", () => {
    const caseDataNoIdentifiers = {
      ...mockCaseData,
      payload: {
        ...mockCaseData.payload,
        identifiers: undefined,
      },
    };

    const result = createTaskDetailViewModel({
      page: createMockPage(caseDataNoIdentifiers),
      request: mockRequest,
      query: mockQuery,
      errors: mockErrors,
    });

    // View model no longer exposes case.sbi directly
    expect(result.data.caseId).toBe("case123");
  });

  it("should handle missing payload answers", () => {
    const caseDataNoAnswers = {
      ...mockCaseData,
      payload: {
        ...mockCaseData.payload,
        answers: undefined,
      },
    };

    const result = createTaskDetailViewModel({
      page: createMockPage(caseDataNoAnswers),
      request: mockRequest,
      query: mockQuery,
      errors: mockErrors,
    });

    // View model no longer exposes case.scheme directly
    expect(result.data.caseId).toBe("case123");
  });

  it("should pass through canComplete value from task data", () => {
    const caseDataWithNoAccess = structuredClone(mockCaseData);
    caseDataWithNoAccess.stage.taskGroups[0].tasks[0].canComplete = false;

    const result = createTaskDetailViewModel({
      page: createMockPage(caseDataWithNoAccess),
      request: mockRequest,
      query: mockQuery,
      errors: mockErrors,
    });

    expect(result.data.currentTask.canComplete).toBe(false);
  });

  it("should call helper functions with correct parameters", async () => {
    const { setActiveLink } = vi.mocked(
      await import("../../common/helpers/navigation-helpers.js"),
    );

    createTaskDetailViewModel({
      page: createMockPage(mockCaseData),
      request: mockRequest,
      query: mockQuery,
      errors: mockErrors,
    });

    // getFormattedGBDate is no longer called in the simplified view model
    expect(setActiveLink).toHaveBeenCalledWith(mockCaseData.links, "tasks");
  });

  it("should set isInteractive to true when stage.interactive is true", () => {
    const interactiveCaseData = {
      ...mockCaseData,
      stage: {
        ...mockCaseData.stage,
        interactive: true,
      },
    };

    const result = createTaskDetailViewModel({
      page: createMockPage(interactiveCaseData),
      request: mockRequest,
      query: mockQuery,
      errors: mockErrors,
    });

    expect(result.data.isInteractive).toBe(true);
  });

  it("should set isInteractive to false when stage.interactive is false", () => {
    const nonInteractiveCaseData = {
      ...mockCaseData,
      stage: {
        ...mockCaseData.stage,
        interactive: false,
      },
    };

    const result = createTaskDetailViewModel({
      page: createMockPage(nonInteractiveCaseData),
      request: mockRequest,
      query: mockQuery,
      errors: mockErrors,
    });

    expect(result.data.isInteractive).toBe(false);
  });

  it("should default isInteractive to true when stage.interactive is not provided", () => {
    const result = createTaskDetailViewModel({
      page: createMockPage(mockCaseData),
      request: mockRequest,
      query: mockQuery,
      errors: mockErrors,
    });

    expect(result.data.isInteractive).toBe(true);
  });

  it("should default isInteractive to true when stage.interactive is undefined", () => {
    const caseDataWithUndefinedInteractive = {
      ...mockCaseData,
      stage: {
        ...mockCaseData.stage,
        interactive: undefined,
      },
    };

    const result = createTaskDetailViewModel({
      page: createMockPage(caseDataWithUndefinedInteractive),
      request: mockRequest,
      query: mockQuery,
      errors: mockErrors,
    });

    expect(result.data.isInteractive).toBe(true);
  });

  it("should handle empty errorList when errors is undefined", () => {
    const result = createTaskDetailViewModel({
      page: createMockPage(mockCaseData),
      request: mockRequest,
      query: mockQuery,
      errors: undefined,
    });

    expect(result.errorList).toEqual([]);
  });

  it("should map value options with comment fields", () => {
    const caseWithStatusOptions = {
      ...mockCaseData,
      stage: {
        code: "stage1",
        taskGroups: [
          {
            code: "group1",
            tasks: [
              {
                code: "task1",
                value: "in_progress",
                commentRefs: [{ ref: "comment1", value: "in_progress" }],
                requiredRoles: { allOf: ["role1"], anyOf: [] },
                valueOptions: [
                  { code: "in_progress", name: "In Progress" },
                  { code: "complete", name: "Complete" },
                  { code: "rejected", name: "Rejected" },
                ],
                commentInputDef: {
                  label: "Add a comment",
                  helpText: "Explain your decision",
                  mandatory: true,
                },
              },
            ],
          },
        ],
      },
    };

    const result = createTaskDetailViewModel({
      page: createMockPage(caseWithStatusOptions),
      request: mockRequest,
      query: mockQuery,
    });

    expect(result.data.currentTask.valueOptions).toHaveLength(3);
    expect(result.data.currentTask.valueOptions[0]).toMatchObject({
      value: "in_progress",
      text: "In Progress",
      checked: true,
    });
    expect(result.data.currentTask.valueOptions[0].conditional).toMatchObject({
      id: "in_progress-comment",
      name: "in_progress-comment",
      label: { text: "Add a comment" },
      hint: { text: "Explain your decision" },
      required: true,
      rows: 5,
    });
  });

  it("should populate comment field from formData on validation error", () => {
    const caseWithStatusOptions = {
      ...mockCaseData,
      stage: {
        code: "stage1",
        taskGroups: [
          {
            code: "group1",
            tasks: [
              {
                code: "task1",
                value: "complete",
                commentRefs: null,
                valueOptions: [
                  { code: "complete", name: "Complete" },
                  { code: "rejected", name: "Rejected" },
                ],
                commentInputDef: {
                  label: "Add a comment",
                  mandatory: true,
                },
              },
            ],
          },
        ],
      },
    };

    const formData = {
      value: "rejected",
      "rejected-comment": "User entered text before validation error",
    };

    const errors = {
      "rejected-comment": "Comment is too short",
    };

    const result = createTaskDetailViewModel({
      page: createMockPage(caseWithStatusOptions),
      request: mockRequest,
      query: mockQuery,
      errors,
      formData,
    });

    const rejectedOption = result.data.currentTask.valueOptions.find(
      (opt) => opt.value === "rejected",
    );

    expect(rejectedOption.conditional.value).toBe(
      "User entered text before validation error",
    );
    expect(rejectedOption.conditional.errorMessage).toBe(
      "Comment is too short",
    );
  });

  it("should populate comment field from existing task comment", () => {
    const caseWithStatusOptions = {
      ...mockCaseData,
      stage: {
        code: "stage1",
        taskGroups: [
          {
            code: "group1",
            tasks: [
              {
                code: "task1",
                value: "complete",
                commentRefs: [
                  { value: "in review", ref: "comment2" },
                  { value: "complete", ref: "comment1" },
                  { value: "foo", ref: "comment3" },
                ],
                valueOptions: [
                  { code: "complete", name: "Complete" },
                  { code: "rejected", name: "Rejected" },
                ],
                commentInputDef: {
                  label: "Add a comment",
                  mandatory: true,
                },
              },
            ],
          },
        ],
      },
      comments: [
        { ref: "comment1", text: "Existing task comment" },
        { ref: "comment2", text: "foo" },
        { ref: "comment3", text: "comment 3 text" },
      ],
    };

    const result = createTaskDetailViewModel({
      page: createMockPage(caseWithStatusOptions),
      request: mockRequest,
      query: mockQuery,
    });

    const completeOption = result.data.currentTask.valueOptions.find(
      (opt) => opt.value === "complete",
    );

    expect(completeOption.conditional.value).toBe("Existing task comment");
  });

  it("should handle existing comment with empty text", () => {
    const caseWithStatusOptions = {
      ...mockCaseData,
      stage: {
        code: "stage1",
        taskGroups: [
          {
            code: "group1",
            tasks: [
              {
                code: "task1",
                value: "complete",
                commentRefs: [{ value: "complete", ref: "comment1" }],
                valueOptions: [
                  { code: "complete", name: "Complete" },
                  { code: "rejected", name: "Rejected" },
                ],
                commentInputDef: {
                  label: "Add a comment",
                  mandatory: true,
                },
              },
            ],
          },
        ],
      },
      comments: [{ ref: "comment1", text: null }],
    };

    const result = createTaskDetailViewModel({
      page: createMockPage(caseWithStatusOptions),
      request: mockRequest,
      query: mockQuery,
    });

    const completeOption = result.data.currentTask.valueOptions.find(
      (opt) => opt.value === "complete",
    );

    expect(completeOption.conditional.value).toBe("");
  });

  it("should handle value options without comment input definition", () => {
    const caseWithStatusOptions = {
      ...mockCaseData,
      stage: {
        code: "stage1",
        taskGroups: [
          {
            code: "group1",
            tasks: [
              {
                code: "task1",
                value: "in_progress",
                commentRefs: null,
                valueOptions: [
                  { code: "in_progress", name: "In Progress" },
                  { code: "complete", name: "Complete" },
                ],
                commentInputDef: null,
              },
            ],
          },
        ],
      },
    };

    const result = createTaskDetailViewModel({
      page: createMockPage(caseWithStatusOptions),
      request: mockRequest,
      query: mockQuery,
    });

    expect(result.data.currentTask.valueOptions).toHaveLength(2);
    expect(result.data.currentTask.valueOptions[0].conditional).toBeUndefined();
    expect(result.data.currentTask.valueOptions[1].conditional).toBeUndefined();
  });

  it("should handle empty value options array", () => {
    const caseWithEmptyOptions = {
      ...mockCaseData,
      stage: {
        code: "stage1",
        taskGroups: [
          {
            code: "group1",
            tasks: [
              {
                code: "task1",
                value: "complete",
                commentRefs: null,
                valueOptions: [],
              },
            ],
          },
        ],
      },
    };

    const result = createTaskDetailViewModel({
      page: createMockPage(caseWithEmptyOptions),
      request: mockRequest,
      query: mockQuery,
    });

    expect(result.data.currentTask.valueOptions).toEqual([]);
  });

  it("should handle comment input without helpText", () => {
    const caseWithStatusOptions = {
      ...mockCaseData,
      stage: {
        code: "stage1",
        taskGroups: [
          {
            code: "group1",
            tasks: [
              {
                code: "task1",
                value: "complete",
                commentRefs: null,
                valueOptions: [{ code: "complete", name: "Complete" }],
                commentInputDef: {
                  label: "Add a comment",
                  mandatory: false,
                },
              },
            ],
          },
        ],
      },
    };

    const result = createTaskDetailViewModel({
      page: createMockPage(caseWithStatusOptions),
      request: mockRequest,
      query: mockQuery,
    });

    const option = result.data.currentTask.valueOptions[0];
    expect(option.conditional.hint).toBeUndefined();
    expect(option.conditional.required).toBe(false);
  });

  it("should override current value from formData", () => {
    const caseWithStatusOptions = {
      ...mockCaseData,
      stage: {
        code: "stage1",
        taskGroups: [
          {
            code: "group1",
            tasks: [
              {
                code: "task1",
                value: "in_progress",
                commentRefs: null,
                valueOptions: [
                  { code: "in_progress", name: "In Progress" },
                  { code: "complete", name: "Complete" },
                ],
              },
            ],
          },
        ],
      },
    };

    const formData = { value: "complete" };

    const result = createTaskDetailViewModel({
      page: createMockPage(caseWithStatusOptions),
      request: mockRequest,
      query: mockQuery,
      errors: undefined,
      formData,
    });

    expect(result.data.currentTask.value).toBe("complete");
    const completeOption = result.data.currentTask.valueOptions.find(
      (opt) => opt.value === "complete",
    );
    expect(completeOption.checked).toBe(true);

    const inProgressOption = result.data.currentTask.valueOptions.find(
      (opt) => opt.value === "in_progress",
    );
    expect(inProgressOption.checked).toBe(false);
  });

  it("should preserve completed field from formData", () => {
    const formData = { completed: true };

    const result = createTaskDetailViewModel({
      page: createMockPage(mockCaseData),
      request: mockRequest,
      query: mockQuery,
      errors: undefined,
      formData,
    });

    expect(result.data.currentTask.completed).toBe(true);
  });

  it("should use task completed value when formData is not provided", () => {
    const caseWithCompletedTask = {
      ...mockCaseData,
      stage: {
        code: "stage1",
        taskGroups: [
          {
            code: "group1",
            tasks: [
              {
                code: "task1",
                value: "complete",
                completed: true,
                commentRefs: null,
              },
            ],
          },
        ],
      },
    };

    const result = createTaskDetailViewModel({
      page: createMockPage(caseWithCompletedTask),
      request: mockRequest,
      query: mockQuery,
    });

    expect(result.data.currentTask.completed).toBe(true);
  });

  describe("notesHistory", () => {
    it("should pass through notesHistory from backend", () => {
      const caseWithNotesHistory = {
        ...mockCaseData,
        stage: {
          code: "stage1",
          taskGroups: [
            {
              code: "group1",
              tasks: [
                {
                  code: "task1",
                  value: "complete",
                  commentRefs: null,
                  notesHistory: [
                    {
                      date: "2025-01-09T10:00:00.000Z",
                      outcome: "Request information",
                      note: "Need more info",
                      addedBy: "User A",
                    },
                    {
                      date: "2025-01-10T14:00:00.000Z",
                      outcome: "Accepted",
                      note: "Approved",
                      addedBy: "User B",
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = createTaskDetailViewModel({
        page: createMockPage(caseWithNotesHistory),
        request: mockRequest,
        query: mockQuery,
      });

      expect(result.data.currentTask.notesHistory).toHaveLength(2);
      expect(result.data.currentTask.notesHistory[0]).toEqual({
        date: "2025-01-09T10:00:00.000Z",
        outcome: "Request information",
        note: "Need more info",
        addedBy: "User A",
      });
    });

    it("should return empty array when notesHistory is undefined", () => {
      const caseWithNoNotesHistory = {
        ...mockCaseData,
        stage: {
          code: "stage1",
          taskGroups: [
            {
              code: "group1",
              tasks: [
                {
                  code: "task1",
                  value: "complete",
                  commentRefs: null,
                },
              ],
            },
          ],
        },
      };

      const result = createTaskDetailViewModel({
        page: createMockPage(caseWithNoNotesHistory),
        request: mockRequest,
        query: mockQuery,
      });

      expect(result.data.currentTask.notesHistory).toEqual([]);
    });

    it("should return empty array when notesHistory is null", () => {
      const caseWithNullNotesHistory = {
        ...mockCaseData,
        stage: {
          code: "stage1",
          taskGroups: [
            {
              code: "group1",
              tasks: [
                {
                  code: "task1",
                  value: "complete",
                  commentRefs: null,
                  notesHistory: null,
                },
              ],
            },
          ],
        },
      };

      const result = createTaskDetailViewModel({
        page: createMockPage(caseWithNullNotesHistory),
        request: mockRequest,
        query: mockQuery,
      });

      expect(result.data.currentTask.notesHistory).toEqual([]);
    });
  });

  describe("hasWriteAccess", () => {
    it("should pass through hasWriteAccess as true when provided", () => {
      const result = createTaskDetailViewModel({
        page: createMockPage(mockCaseData),
        request: mockRequest,
        query: mockQuery,
        hasWriteAccess: true,
      });

      expect(result.data.hasWriteAccess).toBe(true);
    });

    it("should pass through hasWriteAccess as false when provided", () => {
      const result = createTaskDetailViewModel({
        page: createMockPage(mockCaseData),
        request: mockRequest,
        query: mockQuery,
        hasWriteAccess: false,
      });

      expect(result.data.hasWriteAccess).toBe(false);
    });

    it("should set hasWriteAccess to undefined when not provided", () => {
      const result = createTaskDetailViewModel({
        page: createMockPage(mockCaseData),
        request: mockRequest,
        query: mockQuery,
      });

      expect(result.data.hasWriteAccess).toBeUndefined();
    });

    describe("input tasks", () => {
      const inputCaseData = (overrides = {}) => ({
        ...mockCaseData,
        stage: {
          ...mockCaseData.stage,
          taskGroups: [
            {
              code: "group1",
              tasks: [
                {
                  code: "task1",
                  value: "SF123456",
                  commentRefs: [],
                  requiredRoles: { allOf: [], anyOf: [] },
                  canComplete: true,
                  valueOptions: [],
                  input: { type: "text", label: "Reference", maxlength: 20 },
                  ...overrides,
                },
              ],
            },
          ],
        },
      });

      it("surfaces the input field on the current task", () => {
        const result = createTaskDetailViewModel({
          page: createMockPage(inputCaseData()),
          request: mockRequest,
          query: mockQuery,
        });

        expect(result.data.currentTask.input).toEqual(
          expect.objectContaining({
            name: "value",
            type: "text",
            value: "SF123456",
            label: { text: "Reference" },
            attributes: { maxlength: 20 },
          }),
        );
        expect(result.data.currentTask.valueOptions).toEqual([]);
      });

      it("prefers a flashed form value over the saved one", () => {
        const result = createTaskDetailViewModel({
          page: createMockPage(inputCaseData()),
          request: mockRequest,
          query: mockQuery,
          formData: { value: "REJECTED-BY-SERVER" },
        });

        expect(result.data.currentTask.input.value).toBe("REJECTED-BY-SERVER");
      });

      it("attaches the value error to the field and the error list", () => {
        const errors = { value: { text: "Enter Reference", href: "#value" } };

        const result = createTaskDetailViewModel({
          page: createMockPage(inputCaseData()),
          request: mockRequest,
          query: mockQuery,
          errors,
        });

        expect(result.data.currentTask.input.errorMessage).toBe(errors.value);
        expect(result.data.currentTask.valueError).toBe(errors.value);
        expect(result.errorList).toEqual([errors.value]);
      });

      it("leaves input undefined for an option task", () => {
        const result = createTaskDetailViewModel({
          page: createMockPage(mockCaseData),
          request: mockRequest,
          query: mockQuery,
        });

        expect(result.data.currentTask.input).toBeUndefined();
      });
    });
  });
});

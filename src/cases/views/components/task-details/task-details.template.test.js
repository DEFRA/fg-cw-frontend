import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("task-details", () => {
  test("renders", () => {
    const component = render("task-details", {
      caseId: "case-id",
      stageCode: "strage-id",
      taskGroupId: "task-group-id",
      taskId: "task-id",
      currentTask: {
        id: "task1",
        title: "Test Task",
        type: "boolean",
      },
    });

    expect(component).toMatchSnapshot();
  });
});

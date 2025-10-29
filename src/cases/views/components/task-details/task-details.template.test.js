import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("task-details", () => {
  test("renders", () => {
    const component = render("task-details", {
      caseId: "case-id",
      stageCode: "strage-id",
      taskGroupCode: "task-group-code",
      taskCode: "task-id",
      currentTask: {
        code: "task1",
        name: "Test Task",
        type: "boolean",
        canCompleteTask: true,
      },
    });

    expect(component).toMatchSnapshot();
  });
});

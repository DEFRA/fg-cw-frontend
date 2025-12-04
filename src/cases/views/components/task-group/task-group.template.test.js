import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("task-group", () => {
  test("renders", () => {
    const component = render("task-group", {
      caseId: "123",
      stage: {
        name: "Test Stage",
        taskGroups: [
          {
            name: "Group 1",
            tasks: [
              {
                name: "Task 1",
                statusText: "not started",
                statusTheme: "NEUTRAL",
                link: "/cases/123/task/1",
              },
              {
                name: "Task 2",
                statusText: "in progress",
                statusTheme: "INFO",
                link: "/cases/123/task/2",
              },
            ],
          },
        ],
        actions: [
          {
            label: "Complete Stage",
            nextStage: "complete",
          },
        ],
      },
    });

    expect(component).toMatchSnapshot();
  });
});

import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("task-list", () => {
  test("renders a task list when there are tasks", () => {
    const component = render("task-list", {
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
        {
          name: "Task 3",
          statusText: "completed",
          statusTheme: "SUCCESS",
          link: "/cases/123/task/3",
        },
      ],
    });

    expect(component).toMatchSnapshot();
  });

  test("renders nothing when there are no tasks", () => {
    const component = render("task-list", {
      tasks: [],
    });

    expect(component).toMatchSnapshot();
  });
});

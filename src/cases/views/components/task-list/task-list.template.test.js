import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("task-list", () => {
  test("renders a task list when there are tasks", () => {
    const component = render("task-list", {
      tasks: [
        {
          title: "Task 1",
          status: "not started",
          link: "/cases/123/task/1",
        },
        {
          title: "Task 2",
          status: "in progress",
          link: "/cases/123/task/2",
        },
        {
          title: "Task 3",
          status: "completed",
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

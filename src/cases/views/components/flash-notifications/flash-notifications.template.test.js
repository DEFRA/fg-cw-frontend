import { describe, expect, test } from "vitest";
import { render } from "../../../../common/nunjucks/render.js";

describe("flash-notifications", () => {
  test("renders success notification", () => {
    const component = render("flash-notifications", {
      variant: "success",
      title: "Success",
      text: "Your changes have been saved successfully",
    });

    expect(component).toMatchSnapshot();
  });

  test("renders error notification", () => {
    const component = render("flash-notifications", {
      variant: "error",
      title: "Error",
      text: "Something went wrong. Please try again.",
    });

    expect(component).toMatchSnapshot();
  });

  test("renders information notification", () => {
    const component = render("flash-notifications", {
      variant: "information",
      title: "Information",
      text: "Please note this important information",
    });

    expect(component).toMatchSnapshot();
  });

  test("renders warning notification", () => {
    const component = render("flash-notifications", {
      variant: "warning",
      title: "Warning",
      text: "Please be aware of this warning",
    });

    expect(component).toMatchSnapshot();
  });

  test("renders with title as heading", () => {
    const component = render("flash-notifications", {
      variant: "success",
      title: "Custom Success",
      showTitleAsHeading: true,
      text: "Operation completed",
    });

    expect(component).toMatchSnapshot();
  });

  test("renders dismissible alert", () => {
    const component = render("flash-notifications", {
      variant: "success",
      title: "Success",
      text: "Action completed",
      dismissible: true,
    });

    expect(component).toMatchSnapshot();
  });

  test("does not render when params is undefined", () => {
    const component = render("flash-notifications", undefined);

    expect(component.trim()).toBe("");
  });

  test("does not render when params is null", () => {
    const component = render("flash-notifications", null);

    expect(component.trim()).toBe("");
  });
});

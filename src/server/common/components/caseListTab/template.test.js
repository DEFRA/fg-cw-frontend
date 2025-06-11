import { beforeEach, describe, expect, test } from "vitest";
import { data } from "../../test-helpers/application-case-list.js";
import { renderComponent } from "../../test-helpers/component-helpers.js";

describe("Application Case List", () => {
  let $list;

  const tableHeaders = [
    {
      html: "",
      classes: "govuk-!-padding-top-0",
    },
    { text: "ID" },
    { text: "Business", classes: "govuk-!-width-one-quarter" },
    { text: "Date submitted", classes: "govuk-!-width-one-quarter" },
    { text: "Status", classes: "govuk-!-width-one-quarter" },
    { text: "Assigned", classes: "govuk-!-width-one-quarter" },
  ];

  describe("Component", () => {
    beforeEach(() => {
      $list = renderComponent("caseListTab", {
        tabLabel: "My Cases",
        tabTestId: "my-cases-tab",
        tableHeaders,
        data,
      });
    });

    test("Should render application list component with expected heading", () => {
      expect($list("h2")).toHaveLength(1);
      expect($list("h2").text().trim()).toBe("My Cases");
    });

    test("Should render table list with correct rows", () => {
      expect($list("tr")).toHaveLength(5);
    });

    test("Should render correct status tags (New)", () => {
      expect($list(".govuk-tag--blue")).toHaveLength(1);
      expect($list(".govuk-tag--blue").text().trim()).toBe("New");
    });

    test("Should render correct status tags (In Progress)", () => {
      expect($list(".govuk-tag--yellow")).toHaveLength(1);
      expect($list(".govuk-tag--yellow").text().trim()).toBe("In progress");
    });

    test("Should render correct status tags (Not Started)", () => {
      expect($list(".govuk-tag--grey")).toHaveLength(1);
      expect($list(".govuk-tag--grey").text().trim()).toBe("Not started");
    });
  });
});

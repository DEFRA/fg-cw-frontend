import { describe, expect, it } from "vitest";
import { toCaseListCriteria } from "./to-case-list-criteria.js";

describe("toCaseListCriteria", () => {
  it("keeps the search and sort fields from the query", () => {
    expect(
      toCaseListCriteria({
        search: "CASE-1",
        caseRef: "asc",
        workflowCode: "desc",
        createdAt: "asc",
      }),
    ).toEqual({
      search: "CASE-1",
      caseRef: "asc",
      workflowCode: "desc",
      createdAt: "asc",
    });
  });

  it("takes cursor and direction from the page, not the query", () => {
    expect(
      toCaseListCriteria(
        { cursor: "from-query", direction: "backward" },
        { cursor: "from-page", direction: "forward" },
      ),
    ).toEqual({ cursor: "from-page", direction: "forward" });
  });

  it("drops undefined values", () => {
    expect(
      toCaseListCriteria(
        { search: undefined, createdAt: "desc" },
        { cursor: undefined, direction: undefined },
      ),
    ).toEqual({ createdAt: "desc" });
  });

  it("keeps an empty search", () => {
    expect(toCaseListCriteria({ search: "" })).toEqual({ search: "" });
  });

  it("drops assignedUserId, My cases paging and unknown params", () => {
    expect(
      toCaseListCriteria({
        search: "CASE-1",
        assignedUserId: "60c72b2f9b1e8d001c8e4f5a",
        myCursor: "xyz",
        myDirection: "backward",
        unknown: "value",
      }),
    ).toEqual({ search: "CASE-1" });
  });

  it("returns an empty object when given nothing", () => {
    expect(toCaseListCriteria()).toEqual({});
  });
});

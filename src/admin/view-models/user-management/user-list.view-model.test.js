import { describe, expect, it } from "vitest";
import {
  DATE_FORMAT_SHORT_DATE_TIME,
  formatDate,
} from "../../../common/nunjucks/filters/format-date.js";
import { createUserListViewModel } from "./user-list.view-model.js";

describe("createUserListViewModel", () => {
  it("sorts users by name ascending", () => {
    const viewModel = createUserListViewModel([
      { id: "2", name: "Zara Zee" },
      { id: "1", name: "Alice Able" },
    ]);

    expect(viewModel.data.users.rows.map((r) => r.name)).toEqual([
      "Alice Able",
      "Zara Zee",
    ]);
  });

  it("formats lastLogin as short date and time", () => {
    const updatedAt = "2025-01-01T14:05:00.000Z";

    const viewModel = createUserListViewModel([
      { id: "1", name: "Alice Able", updatedAt },
    ]);

    expect(viewModel.data.users.rows[0].lastLogin).toEqual(
      formatDate(updatedAt, DATE_FORMAT_SHORT_DATE_TIME),
    );
  });

  it("uses blank lastLogin when updatedAt is missing", () => {
    const viewModel = createUserListViewModel([
      { id: "1", name: "Alice Able" },
    ]);

    expect(viewModel.data.users.rows[0].lastLogin).toEqual("");
  });

  it("uses blank lastLogin when updatedAt is null", () => {
    const viewModel = createUserListViewModel([
      { id: "1", name: "Alice Able", updatedAt: null },
    ]);

    expect(viewModel.data.users.rows[0].lastLogin).toEqual("");
  });

  it("returns an empty table when users is not an array", () => {
    const viewModel = createUserListViewModel(null);

    expect(viewModel.data.users.rows).toEqual([]);
  });

  it("builds view link hrefs from user id", () => {
    const viewModel = createUserListViewModel([
      { id: "user-123", name: "Alice Able" },
    ]);

    expect(viewModel.data.users.rows[0].viewHref).toEqual(
      "/admin/user-management/user-123",
    );
  });
});

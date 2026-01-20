import { describe, expect, it } from "vitest";
import {
  DATE_FORMAT_SHORT_DATE_TIME,
  formatDate,
} from "../../../common/nunjucks/filters/format-date.js";
import { createUserListViewModel } from "./user-list.view-model.js";

describe("createUserListViewModel", () => {
  it("sorts users by name ascending", () => {
    const viewModel = createUserListViewModel([
      { id: "2", name: "Example Zulu" },
      { id: "1", name: "Example Alpha" },
    ]);

    expect(viewModel.data.users.rows.map((r) => r.name)).toEqual([
      "Example Alpha",
      "Example Zulu",
    ]);
  });

  it("formats lastLogin as short date and time", () => {
    const lastLoginAt = "2025-01-01T14:05:00.000Z";

    const viewModel = createUserListViewModel([
      { id: "1", name: "Example Alpha", lastLoginAt },
    ]);

    expect(viewModel.data.users.rows[0].lastLogin).toEqual(
      formatDate(lastLoginAt, DATE_FORMAT_SHORT_DATE_TIME),
    );
  });

  it("uses blank lastLogin when updatedAt is missing", () => {
    const viewModel = createUserListViewModel([
      { id: "1", name: "Example Alpha" },
    ]);

    expect(viewModel.data.users.rows[0].lastLogin).toEqual("");
  });

  it("uses blank lastLogin when updatedAt is null", () => {
    const viewModel = createUserListViewModel([
      { id: "1", name: "Example Alpha", updatedAt: null },
    ]);

    expect(viewModel.data.users.rows[0].lastLogin).toEqual("");
  });

  it("returns an empty table when users is not an array", () => {
    const viewModel = createUserListViewModel(null);

    expect(viewModel.data.users.rows).toEqual([]);
  });

  it("builds view link hrefs from user id", () => {
    const viewModel = createUserListViewModel([
      { id: "user-123", name: "Example Alpha" },
    ]);

    expect(viewModel.data.users.rows[0].viewHref).toEqual(
      "/admin/user-management/user-123",
    );
  });
});

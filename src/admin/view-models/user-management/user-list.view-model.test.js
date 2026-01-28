import { describe, expect, it, vi } from "vitest";
import {
  DATE_FORMAT_SHORT_DATE_TIME,
  formatDate,
} from "../../../common/nunjucks/filters/format-date.js";
import { createUserListViewModel } from "./user-list.view-model.js";

vi.mock("../../../common/view-models/header.view-model.js");

const mockRequest = { path: "/admin/user-management" };

const createMockPage = (users) => ({
  data: users,
  header: { navItems: [] },
});

describe("createUserListViewModel", () => {
  it("sorts users by name ascending", () => {
    const viewModel = createUserListViewModel({
      page: createMockPage([
        { id: "2", name: "Zara Zee" },
        { id: "1", name: "Alice Able" },
      ]),
      request: mockRequest,
    });

    expect(viewModel.data.users.rows.map((r) => r.name)).toEqual([
      "Alice Able",
      "Zara Zee",
    ]);
  });

  it("formats lastLogin as short date and time", () => {
    const lastLoginAt = "2025-01-01T14:05:00.000Z";

    const viewModel = createUserListViewModel({
      page: createMockPage([{ id: "1", name: "Alice Able", lastLoginAt }]),
      request: mockRequest,
    });

    expect(viewModel.data.users.rows[0].lastLogin).toEqual(
      formatDate(lastLoginAt, DATE_FORMAT_SHORT_DATE_TIME),
    );
  });

  it("uses blank lastLogin when updatedAt is missing", () => {
    const viewModel = createUserListViewModel({
      page: createMockPage([{ id: "1", name: "Alice Able" }]),
      request: mockRequest,
    });

    expect(viewModel.data.users.rows[0].lastLogin).toEqual("");
  });

  it("uses blank lastLogin when updatedAt is null", () => {
    const viewModel = createUserListViewModel({
      page: createMockPage([{ id: "1", name: "Alice Able", updatedAt: null }]),
      request: mockRequest,
    });

    expect(viewModel.data.users.rows[0].lastLogin).toEqual("");
  });

  it("returns an empty table when users is not an array", () => {
    const viewModel = createUserListViewModel({
      page: createMockPage(null),
      request: mockRequest,
    });

    expect(viewModel.data.users.rows).toEqual([]);
  });

  it("builds view link hrefs from user id", () => {
    const viewModel = createUserListViewModel({
      page: createMockPage([{ id: "user-123", name: "Alice Able" }]),
      request: mockRequest,
    });

    expect(viewModel.data.users.rows[0].viewHref).toEqual(
      "/admin/user-management/user-123",
    );
  });
});

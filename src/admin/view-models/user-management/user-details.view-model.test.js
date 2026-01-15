import { describe, expect, it } from "vitest";
import {
  DATE_FORMAT_FULL_DATE_TIME,
  formatDate,
} from "../../../common/nunjucks/filters/format-date.js";
import { createUserDetailsViewModel } from "./user-details.view-model.js";

describe("createUserDetailsViewModel", () => {
  it("filters IDP roles to FCP.Casework roles only", () => {
    const viewModel = createUserDetailsViewModel(
      {
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        updatedAt: null,
        idpRoles: ["FCP.Casework.Admin", "Other.Role"],
        appRoles: {},
      },
      { id: "someone-else" },
    );

    expect(viewModel.data.idpRoles).toEqual(["FCP.Casework.Admin"]);
  });

  it("uses empty IDP roles when missing", () => {
    const viewModel = createUserDetailsViewModel(
      {
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        updatedAt: null,
        appRoles: {},
      },
      { id: "someone-else" },
    );

    expect(viewModel.data.idpRoles).toEqual([]);
  });

  it("formats last login when updatedAt is present", () => {
    const updatedAt = "2026-01-13T16:06:00.000Z";

    const viewModel = createUserDetailsViewModel(
      {
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        updatedAt,
        idpRoles: [],
        appRoles: {},
      },
      { id: "someone-else" },
    );

    expect(viewModel.data.summary.rows[2].value.text).toEqual(
      formatDate(updatedAt, DATE_FORMAT_FULL_DATE_TIME),
    );
  });

  it("uses blank last login when updatedAt is missing", () => {
    const viewModel = createUserDetailsViewModel(
      {
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        idpRoles: [],
        appRoles: {},
      },
      { id: "someone-else" },
    );

    expect(viewModel.data.summary.rows[2].value.text).toEqual("");
  });

  it("hides edit roles when viewing own record", () => {
    const viewModel = createUserDetailsViewModel(
      {
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        updatedAt: null,
        idpRoles: [],
        appRoles: {},
      },
      { id: "user-123" },
    );

    expect(viewModel.data.showEditRoles).toEqual(false);
  });

  it("shows edit roles when viewing another user", () => {
    const viewModel = createUserDetailsViewModel(
      {
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        updatedAt: null,
        idpRoles: [],
        appRoles: {},
      },
      { id: "admin-user" },
    );

    expect(viewModel.data.showEditRoles).toEqual(true);
  });
});

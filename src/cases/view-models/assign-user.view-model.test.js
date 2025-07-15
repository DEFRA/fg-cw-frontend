import { describe, expect, it } from "vitest";
import { createAssignUserViewModel } from "./assign-user.view-model.js";

describe("createAssignUserViewModel", () => {
  it("creates view model with case and users data", () => {
    const mockCase = {
      _id: "case-123",
      payload: {
        clientRef: "CLIENT-001",
        code: "CODE-001",
      },
      assignedUser: null,
    };

    const mockUsers = [
      {
        id: "user-1",
        name: "John Doe",
        appRoles: ["ROLE_ADMIN", "ROLE_MANAGER"],
      },
      {
        id: "user-2",
        name: "Jane Smith",
        appRoles: ["ROLE_REVIEWER"],
      },
    ];

    const result = createAssignUserViewModel(mockCase, mockUsers);

    expect(result).toEqual({
      pageTitle: "Assign",
      pageHeading: "Assign",
      breadcrumbs: [],
      data: {
        caseId: "case-123",
        usersSelect: [
          {
            value: "",
            text: "Select a user",
            selected: true,
          },
          {
            value: "user-1",
            text: "John Doe",
            selected: false,
          },
          {
            value: "user-2",
            text: "Jane Smith",
            selected: false,
          },
        ],
      },
    });
  });

  it("creates view model with assigned user selected", () => {
    const mockCase = {
      _id: "case-456",
      payload: {
        clientRef: "CLIENT-002",
        code: "CODE-002",
      },
      assignedUser: {
        id: "user-2",
        name: "Jane Smith",
      },
    };

    const mockUsers = [
      {
        id: "user-1",
        name: "John Doe",
        appRoles: ["ROLE_ADMIN"],
      },
      {
        id: "user-2",
        name: "Jane Smith",
        appRoles: ["ROLE_REVIEWER"],
      },
      {
        id: "user-3",
        name: "Bob Wilson",
        appRoles: ["ROLE_MANAGer"],
      },
    ];

    const result = createAssignUserViewModel(mockCase, mockUsers);

    expect(result.data.usersSelect).toEqual([
      {
        value: "",
        text: "Select a user",
        selected: false,
      },
      {
        value: "user-1",
        text: "John Doe",
        selected: false,
      },
      {
        value: "user-2",
        text: "Jane Smith",
        selected: true,
      },
      {
        value: "user-3",
        text: "Bob Wilson",
        selected: false,
      },
    ]);
  });

  it("creates view model with undefined assignedUser", () => {
    const mockCase = {
      _id: "case-undefined",
      payload: {
        clientRef: "CLIENT-UNDEFINED",
        code: "CODE-UNDEFINED",
      },
      assignedUser: undefined,
    };

    const mockUsers = [
      {
        id: "user-1",
        name: "Test User",
        appRoles: ["user"],
      },
    ];

    const result = createAssignUserViewModel(mockCase, mockUsers);

    expect(result.data.usersSelect).toEqual([
      {
        value: "",
        text: "Select a user",
        selected: true,
      },
      {
        value: "user-1",
        text: "Test User",
        selected: false,
      },
    ]);
  });
});

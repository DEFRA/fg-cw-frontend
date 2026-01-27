import { describe, expect, it } from "vitest";
import { createUserRolesTableViewModel } from "./user-roles-table.view-model.js";

const buildRole = ({ code, description, assignable } = {}) => ({
  id: `id-${code}`,
  code,
  description,
  assignable,
});

describe("createUserRolesTableViewModel", () => {
  it("sorts checked roles first then by code", () => {
    const viewModel = createUserRolesTableViewModel({
      user: {
        id: "user-123",
        name: "Martin Smith",
        appRoles: {
          PMF_B: {},
        },
      },
      roles: [
        buildRole({
          code: "PMF_C",
          description: "Role C",
          assignable: true,
        }),
        buildRole({
          code: "PMF_A",
          description: "Role A",
          assignable: true,
        }),
        buildRole({
          code: "PMF_B",
          description: "Role B",
          assignable: true,
        }),
      ],
    });

    expect(viewModel.map((r) => r.code)).toEqual(["PMF_B", "PMF_A", "PMF_C"]);
  });

  it("populates description for allocated but unassignable roles", () => {
    const viewModel = createUserRolesTableViewModel({
      user: {
        id: "user-123",
        name: "Martin Smith",
        appRoles: {
          PMF_READ_WRITE: {},
        },
      },
      roles: [
        buildRole({
          code: "PMF_READ_WRITE",
          description: "Pigs Might Fly read write",
          assignable: false,
        }),
      ],
    });

    expect(viewModel).toEqual([
      expect.objectContaining({
        code: "PMF_READ_WRITE",
        description: "Pigs Might Fly read write",
      }),
    ]);
  });

  it("ignores non-assignable roles unless already assigned", () => {
    const viewModel = createUserRolesTableViewModel({
      user: {
        id: "user-123",
        name: "Martin Smith",
        appRoles: {},
      },
      roles: [
        buildRole({
          code: "PMF_NOT_ASSIGNABLE",
          description: "Not assignable",
          assignable: false,
        }),
      ],
    });

    expect(viewModel).toEqual([]);
  });

  it("falls back to assigned roles when form roles missing", () => {
    const viewModel = createUserRolesTableViewModel({
      user: {
        id: "user-123",
        name: "Martin Smith",
        appRoles: {
          PMF_READ: {},
        },
      },
      roles: [
        buildRole({
          code: "PMF_READ",
          description: "Read",
          assignable: true,
        }),
      ],
      formData: {
        startDate__PMF_READ: "2026-01-01",
      },
    });

    expect(viewModel).toEqual([
      expect.objectContaining({
        code: "PMF_READ",
        checked: true,
      }),
    ]);
  });

  it("supports flexible date inputs and normalises to yyyy-MM-dd", () => {
    const viewModel = createUserRolesTableViewModel({
      user: {
        id: "user-123",
        name: "Martin Smith",
        appRoles: {},
      },
      roles: [
        buildRole({
          code: "PMF_READ",
          description: "Read",
          assignable: true,
        }),
      ],
      formData: {
        roles: ["PMF_READ"],
        startDate__PMF_READ: "1 Jan 2026",
        endDate__PMF_READ: "2026-02-02",
      },
    });

    expect(viewModel).toEqual([
      expect.objectContaining({
        code: "PMF_READ",
        checked: true,
        startDate: "2026-01-01",
        endDate: "2026-02-02",
      }),
    ]);
  });
});

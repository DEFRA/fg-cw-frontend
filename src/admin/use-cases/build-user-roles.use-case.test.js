import { describe, expect, it } from "vitest";

import { buildRoleDateKeys } from "../../common/helpers/role-helpers.js";
import { buildUserRolesUseCase } from "./build-user-roles.use-case.js";

describe("buildUserRolesUseCase", () => {
  it("maps valid dates to appRoles in yyyy-MM-dd format", () => {
    const { startKey, endKey } = buildRoleDateKeys("PMF_READ");

    const result = buildUserRolesUseCase({
      formData: {
        roles: ["PMF_READ"],
        [startKey]: "1 Jan 2026",
        [endKey]: "2026-02-02",
      },
    });

    expect(result).toEqual({
      appRoles: {
        PMF_READ: {
          startDate: "2026-01-01",
          endDate: "2026-02-02",
        },
      },
      errors: {},
    });
  });

  it("returns start date validation error and omits invalid start date", () => {
    const { startKey, endKey } = buildRoleDateKeys("PMF_READ");

    const result = buildUserRolesUseCase({
      formData: {
        roles: ["PMF_READ"],
        [startKey]: "not-a-date",
        [endKey]: "2026-02-02",
      },
    });

    expect(result).toEqual({
      appRoles: {
        PMF_READ: {
          endDate: "2026-02-02",
        },
      },
      errors: {
        [startKey]: "Invalid Start Date",
      },
    });
  });

  it("returns end date validation error and omits invalid end date", () => {
    const { startKey, endKey } = buildRoleDateKeys("PMF_READ");

    const result = buildUserRolesUseCase({
      formData: {
        roles: ["PMF_READ"],
        [startKey]: "2026-01-01",
        [endKey]: "not-a-date",
      },
    });

    expect(result).toEqual({
      appRoles: {
        PMF_READ: {
          startDate: "2026-01-01",
        },
      },
      errors: {
        [endKey]: "Invalid End Date",
      },
    });
  });

  it("sets date order error on end field when only start changed", () => {
    const { startKey, endKey } = buildRoleDateKeys("PMF_READ");

    const result = buildUserRolesUseCase({
      formData: {
        roles: ["PMF_READ"],
        [startKey]: "2026-09-01",
        [endKey]: "2025-08-02",
      },
    });

    expect(result.errors).toEqual({
      [endKey]: "End date cannot be before start date",
    });
  });

  it("sets date order error on end field when start has not changed", () => {
    const { startKey, endKey } = buildRoleDateKeys("PMF_READ");

    const result = buildUserRolesUseCase({
      formData: {
        roles: ["PMF_READ"],
        [startKey]: "2025-07-01",
        [endKey]: "2025-01-01",
      },
    });

    expect(result.errors).toEqual({
      [endKey]: "End date cannot be before start date",
    });
  });

  it("returns empty appRoles and errors when roles are missing", () => {
    const result = buildUserRolesUseCase({
      formData: {},
    });

    expect(result).toEqual({
      appRoles: {},
      errors: {},
    });
  });

  it("supports a single role provided as a string", () => {
    const { startKey, endKey } = buildRoleDateKeys("PMF_READ");

    const result = buildUserRolesUseCase({
      formData: {
        roles: "PMF_READ",
        [startKey]: "2026-01-01",
        [endKey]: "2026-02-01",
      },
    });

    expect(result).toEqual({
      appRoles: {
        PMF_READ: {
          startDate: "2026-01-01",
          endDate: "2026-02-01",
        },
      },
      errors: {},
    });
  });

  it("returns empty appRoles and errors when formData is undefined", () => {
    const result = buildUserRolesUseCase();

    expect(result).toEqual({
      appRoles: {},
      errors: {},
    });
  });
});

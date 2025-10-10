import { describe, expect, it, vi } from "vitest";
import { assignUserToCase } from "../repositories/case.repository.js";
import { assignUserToCaseUseCase } from "./assign-user-to-case.use-case.js";

vi.mock("../repositories/case.repository.js");

describe("assignUserToCaseUseCase", () => {
  const authContext = {
    profile: {
      oid: "12345678-1234-1234-1234-123456789012",
      email: "bob.bill@defra.gov.uk",
      name: "Bob Bill",
      roles: ["FCP.Casework.Read"],
    },
  };

  it("calls assigns user to case", async () => {
    const data = {
      caseId: "case-123",
      assignedUserId: "user-456",
    };

    assignUserToCase.mockResolvedValue(undefined);

    const result = await assignUserToCaseUseCase(authContext, data);

    expect(assignUserToCase).toHaveBeenCalledWith(authContext, {
      caseId: "case-123",
      assignedUserId: "user-456",
    });
    expect(result).toBeUndefined();
  });

  it("converts empty string assignedUserId to null", async () => {
    const data = {
      caseId: "case-789",
      assignedUserId: "",
    };

    assignUserToCase.mockResolvedValue(undefined);

    const result = await assignUserToCaseUseCase(authContext, data);

    expect(assignUserToCase).toHaveBeenCalledWith(authContext, {
      caseId: "case-789",
      assignedUserId: null,
    });
    expect(result).toBeUndefined();
  });
});

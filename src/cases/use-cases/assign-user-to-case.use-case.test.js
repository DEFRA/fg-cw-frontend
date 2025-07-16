import { describe, expect, it, vi } from "vitest";
import { assignUserToCase } from "../repositories/case.repository.js";
import { assignUserToCaseUseCase } from "./assign-user-to-case.use-case.js";

vi.mock("../repositories/case.repository.js");

describe("assignUserToCaseUseCase", () => {
  it("calls assigns user to case", async () => {
    const data = {
      caseId: "case-123",
      assignedUserId: "user-456",
    };

    assignUserToCase.mockResolvedValue(undefined);

    const result = await assignUserToCaseUseCase(data);

    expect(assignUserToCase).toHaveBeenCalledWith({
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

    const result = await assignUserToCaseUseCase(data);

    expect(assignUserToCase).toHaveBeenCalledWith({
      caseId: "case-789",
      assignedUserId: null,
    });
    expect(result).toBeUndefined();
  });
});

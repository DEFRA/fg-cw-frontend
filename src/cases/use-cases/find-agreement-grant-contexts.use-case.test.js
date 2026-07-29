import { beforeEach, describe, expect, test, vi } from "vitest";
import { findById } from "../repositories/case.repository.js";
import { findAgreementGrantContextsUseCase } from "./find-agreement-grant-contexts.use-case.js";

vi.mock("../repositories/case.repository.js");

describe("findAgreementGrantContextsUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("associates every agreement reference with the case workflow grant code", async () => {
    const authContext = { token: "token" };
    findById.mockResolvedValue({
      workflowCode: "soil-improvement",
      supplementaryData: {
        agreements: [
          { agreementRef: "SOIL-001" },
          { agreementRef: "SOIL-002" },
        ],
      },
    });

    await expect(
      findAgreementGrantContextsUseCase(authContext, "case-id"),
    ).resolves.toEqual([
      { agreementRef: "SOIL-001", grantCode: "soil-improvement" },
      { agreementRef: "SOIL-002", grantCode: "soil-improvement" },
    ]);
    expect(findById).toHaveBeenCalledWith(authContext, "case-id");
  });

  test("returns no contexts when the case has no grant code", async () => {
    findById.mockResolvedValue({
      supplementaryData: { agreements: [{ agreementRef: "LEGACY-001" }] },
    });

    await expect(
      findAgreementGrantContextsUseCase({}, "case-id"),
    ).resolves.toEqual([]);
  });
});

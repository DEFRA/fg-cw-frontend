import { describe, expect, test, vi } from "vitest";
import { findAll } from "../repositories/case.repository.js";
import { findAllCasesUseCase } from "./find-all-cases.use-case.js";

vi.mock("../repositories/case.repository.js");

describe("findAllCasesUseCase", () => {
  const authContext = {
    profile: {
      oid: "12345678-1234-1234-1234-123456789012",
      email: "bob.bill@defra.gov.uk",
      name: "Bob Bill",
      roles: ["FCP.Casework.Read"],
    },
  };

  test("returns all cases when repository succeeds", async () => {
    const mockCases = [
      {
        _id: "case-1",
        clientRef: "client-ref-1",
        code: "case-code-1",
        workflowCode: "workflow-1",
        currentStage: "stage-1",
        stages: ["stage-1", "stage-2"],
        createdAt: "2021-01-01T00:00:00.000Z",
        submittedAt: "2021-01-15T10:30:00.000Z",
        status: "In Progress",
        assignedUser: "john doe",
      },
      {
        _id: "case-2",
        clientRef: "client-ref-2",
        code: "case-code-2",
        workflowCode: "workflow-2",
        currentStage: "stage-2",
        stages: ["stage-1", "stage-2"],
        createdAt: "2021-02-01T00:00:00.000Z",
        submittedAt: "2021-02-15T10:30:00.000Z",
        status: "Completed",
        assignedUser: "jane smith",
      },
    ];

    findAll.mockResolvedValueOnce(mockCases);

    const result = await findAllCasesUseCase(authContext);

    expect(findAll).toHaveBeenCalledOnce();
    expect(findAll).toHaveBeenCalledWith(authContext, undefined);
    expect(result).toEqual(mockCases);
  });

  test("returns empty array when no cases exist", async () => {
    const mockCases = [];

    findAll.mockResolvedValueOnce(mockCases);

    const result = await findAllCasesUseCase(authContext);

    expect(findAll).toHaveBeenCalledOnce();
    expect(findAll).toHaveBeenCalledWith(authContext, undefined);
    expect(result).toEqual([]);
  });

  test("returns single case when only one exists", async () => {
    const mockCases = [
      {
        _id: "case-single",
        clientRef: "client-ref-single",
        code: "case-code-single",
        workflowCode: "workflow-single",
        currentStage: "stage-1",
        stages: ["stage-1"],
        createdAt: "2021-01-01T00:00:00.000Z",
        submittedAt: "2021-01-15T10:30:00.000Z",
        status: "Active",
        assignedUser: "user-single",
      },
    ];

    findAll.mockResolvedValueOnce(mockCases);

    const result = await findAllCasesUseCase(authContext);

    expect(findAll).toHaveBeenCalledOnce();
    expect(result).toEqual(mockCases);
    expect(result).toHaveLength(1);
  });

  test("propagates error when repository throws", async () => {
    const error = new Error("Repository failed");
    findAll.mockRejectedValueOnce(error);

    await expect(findAllCasesUseCase(authContext)).rejects.toThrow(
      "Repository failed",
    );
    expect(findAll).toHaveBeenCalledOnce();
  });

  test("calls repository without parameters", async () => {
    const mockCases = [];
    findAll.mockResolvedValueOnce(mockCases);

    await findAllCasesUseCase(authContext);

    expect(findAll).toHaveBeenCalledWith(authContext, undefined);
  });

  test("passes query parameter through to repository", async () => {
    const mockCases = [];
    const query = { cursor: "abc", direction: "forward" };
    findAll.mockResolvedValueOnce(mockCases);

    const result = await findAllCasesUseCase(authContext, query);

    expect(findAll).toHaveBeenCalledOnce();
    expect(findAll).toHaveBeenCalledWith(authContext, query);
    expect(result).toEqual(mockCases);
  });
});

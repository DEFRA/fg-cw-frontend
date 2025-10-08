import { describe, expect, it, vi } from "vitest";
import { addNoteToCase } from "../repositories/case.repository.js";
import { addNoteToCaseUseCase } from "./add-note-to-case.use-case.js";

vi.mock("../repositories/case.repository.js");

describe("addNoteToCaseUseCase", () => {
  const authContext = {
    profile: {
      oid: "12345678-1234-1234-1234-123456789012",
      email: "bob.bill@defra.gov.uk",
      name: "Bob Bill",
      roles: ["FCP.Casework.Read"],
    },
  };

  it("calls repository with correct data", async () => {
    const mockData = {
      caseId: "68495db5afe2d27b09b2ee47",
      type: "NOTE_ADDED",
      text: "This is a test note",
    };

    addNoteToCase.mockResolvedValue();

    await addNoteToCaseUseCase(authContext, mockData);

    expect(addNoteToCase).toHaveBeenCalledWith(authContext, mockData);
    expect(addNoteToCase).toHaveBeenCalledTimes(1);
  });

  it("returns repository result", async () => {
    const mockData = {
      caseId: "test-case-id",
      type: "CUSTOM_NOTE",
      text: "Custom note text",
    };

    const mockResult = { success: true, noteId: "new-note-id" };
    addNoteToCase.mockResolvedValue(mockResult);

    const result = await addNoteToCaseUseCase(authContext, mockData);

    expect(result).toEqual(mockResult);
  });

  it("propagates error when repository throws", async () => {
    const mockData = {
      caseId: "error-case",
      type: "NOTE_ADDED",
      text: "This will fail",
    };

    const error = new Error("Repository failed");
    addNoteToCase.mockRejectedValue(error);

    await expect(addNoteToCaseUseCase(authContext, mockData)).rejects.toThrow(
      "Repository failed",
    );
    expect(addNoteToCase).toHaveBeenCalledWith(authContext, mockData);
  });
});

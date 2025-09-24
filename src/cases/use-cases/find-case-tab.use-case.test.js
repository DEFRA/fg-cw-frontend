import { describe, expect, it, vi } from "vitest";
import { findTabById } from "../repositories/case.repository.js";
import { findCaseTabUseCase } from "./find-case-tab.use-case.js";

vi.mock("../repositories/case.repository.js");

describe("findCaseTabUseCase", () => {
  it("returns tab data from repository", async () => {
    const caseId = "case-123";
    const tabId = "caseDetails";
    const mockTabData = {
      _id: "case-123",
      caseRef: "AGR-2024-001",
      tabId: "caseDetails",
      links: [
        { id: "tasks", text: "Tasks", href: "/cases/case-123" },
        {
          id: "caseDetails",
          text: "Case Details",
          href: "/cases/case-123/case-details",
        },
        { id: "notes", text: "Notes", href: "/cases/case-123/notes" },
      ],
      tabData: {
        title: "Case Details",
        sections: [
          {
            title: "Basic Information",
            fields: [
              { label: "Case Reference", value: "AGR-2024-001" },
              { label: "Status", value: "Active" },
            ],
          },
        ],
      },
    };

    findTabById.mockResolvedValue(mockTabData);

    const result = await findCaseTabUseCase(caseId, tabId);

    expect(findTabById).toHaveBeenCalledWith(caseId, tabId);
    expect(result).toEqual(mockTabData);
  });

  it("handles different tab types", async () => {
    const caseId = "case-456";
    const tabId = "timeline";
    const mockTimelineData = {
      _id: "case-456",
      caseRef: "TIM-2024-002",
      tabId: "timeline",
      links: [
        { id: "tasks", text: "Tasks", href: "/cases/case-456" },
        { id: "timeline", text: "Timeline", href: "/cases/case-456/timeline" },
      ],
      events: [
        {
          timestamp: "2023-01-15T10:30:00Z",
          event: "Case created",
          user: "system",
        },
        {
          timestamp: "2023-01-16T14:20:00Z",
          event: "Task assigned",
          user: "john.smith",
        },
      ],
    };

    findTabById.mockResolvedValue(mockTimelineData);

    const result = await findCaseTabUseCase(caseId, tabId);

    expect(findTabById).toHaveBeenCalledWith(caseId, tabId);
    expect(result).toEqual(mockTimelineData);
  });

  it("returns null when tab not found", async () => {
    const caseId = "nonexistent-case";
    const tabId = "nonexistent-tab";

    findTabById.mockResolvedValue(null);

    const result = await findCaseTabUseCase(caseId, tabId);

    expect(findTabById).toHaveBeenCalledWith(caseId, tabId);
    expect(result).toBeNull();
  });

  it("returns undefined when tab data is undefined", async () => {
    const caseId = "case-undefined";
    const tabId = "undefined-tab";

    findTabById.mockResolvedValue(undefined);

    const result = await findCaseTabUseCase(caseId, tabId);

    expect(findTabById).toHaveBeenCalledWith(caseId, tabId);
    expect(result).toBeUndefined();
  });

  it("bubbles up repository errors", async () => {
    const caseId = "case-error";
    const tabId = "error-tab";
    const repositoryError = new Error("Database connection failed");

    findTabById.mockRejectedValue(repositoryError);

    await expect(findCaseTabUseCase(caseId, tabId)).rejects.toThrow(
      "Database connection failed",
    );

    expect(findTabById).toHaveBeenCalledWith(caseId, tabId);
  });

  it("handles empty case ID", async () => {
    const caseId = "";
    const tabId = "caseDetails";
    const mockEmptyResponse = null;

    findTabById.mockResolvedValue(mockEmptyResponse);

    const result = await findCaseTabUseCase(caseId, tabId);

    expect(findTabById).toHaveBeenCalledWith("", tabId);
    expect(result).toBeNull();
  });

  it("handles empty tab ID", async () => {
    const caseId = "case-123";
    const tabId = "";
    const mockEmptyResponse = null;

    findTabById.mockResolvedValue(mockEmptyResponse);

    const result = await findCaseTabUseCase(caseId, tabId);

    expect(findTabById).toHaveBeenCalledWith(caseId, "");
    expect(result).toBeNull();
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer } from "../../../server/index.js";
import { findCaseTabUseCase } from "../../use-cases/find-case-tab.use-case.js";
import { createViewTabViewModel } from "../../view-models/view-tab.view-model.js";
import { viewCaseTabRoute } from "./view-case-tab.route.js";

vi.mock("../../use-cases/find-case-tab.use-case.js");

describe("viewCaseTabRoute", () => {
  let server;

  beforeEach(async () => {
    server = await createServer();
    server.route(viewCaseTabRoute);
  });

  afterEach(async () => {
    await server.stop();
  });

  it("renders tab view with correct data", async () => {
    const mockTabData = {
      _id: "case-123",
      caseRef: "AGR-2024-001",
      tabId: "case-details",
      links: [
        { id: "tasks", text: "Tasks", href: "/cases/case-123" },
        {
          id: "case-details",
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

    findCaseTabUseCase.mockResolvedValue(mockTabData);

    const response = await server.inject({
      method: "GET",
      url: "/cases/case-123/case-details",
    });

    expect(response.statusCode).toBe(200);
    expect(findCaseTabUseCase).toHaveBeenCalledWith("case-123", "case-details");

    // Verify the view model was created correctly using the real function
    const expectedViewModel = createViewTabViewModel(
      mockTabData,
      "case-details",
    );
    expect(expectedViewModel.pageTitle).toBe("Case Details AGR-2024-001");
    expect(expectedViewModel.breadcrumbs).toEqual([]);
    expect(expectedViewModel.data._id).toBe("case-123");
    expect(expectedViewModel.data.caseRef).toBe("AGR-2024-001");
    expect(expectedViewModel.data.links).toEqual([
      { id: "tasks", text: "Tasks", href: "/cases/case-123", active: false },
      {
        id: "case-details",
        text: "Case Details",
        href: "/cases/case-123/case-details",
        active: true,
      },
      {
        id: "notes",
        text: "Notes",
        href: "/cases/case-123/notes",
        active: false,
      },
    ]);
  });

  it("handles different tab types", async () => {
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
      ],
    };

    findCaseTabUseCase.mockResolvedValue(mockTimelineData);

    const response = await server.inject({
      method: "GET",
      url: "/cases/case-456/timeline",
    });

    expect(response.statusCode).toBe(200);
    expect(findCaseTabUseCase).toHaveBeenCalledWith("case-456", "timeline");

    // Verify the view model was created correctly using the real function
    const expectedViewModel = createViewTabViewModel(
      mockTimelineData,
      "timeline",
    );
    expect(expectedViewModel.pageTitle).toBe("Timeline TIM-2024-002");
    expect(expectedViewModel.breadcrumbs).toEqual([]);
    expect(expectedViewModel.data._id).toBe("case-456");
    expect(expectedViewModel.data.caseRef).toBe("TIM-2024-002");
    expect(expectedViewModel.data.events).toEqual(mockTimelineData.events);
    expect(expectedViewModel.data.links).toEqual([
      { id: "tasks", text: "Tasks", href: "/cases/case-456", active: false },
      {
        id: "timeline",
        text: "Timeline",
        href: "/cases/case-456/timeline",
        active: true,
      },
    ]);
  });

  it("handles use case returning null", async () => {
    findCaseTabUseCase.mockResolvedValue(null);

    const response = await server.inject({
      method: "GET",
      url: "/cases/nonexistent/tab",
    });

    expect(response.statusCode).toBe(500);
    expect(findCaseTabUseCase).toHaveBeenCalledWith("nonexistent", "tab");
  });

  it("handles use case errors", async () => {
    const useCaseError = new Error("Database connection failed");
    findCaseTabUseCase.mockRejectedValue(useCaseError);

    const response = await server.inject({
      method: "GET",
      url: "/cases/case-error/tab-error",
    });

    expect(response.statusCode).toBe(500);
    expect(findCaseTabUseCase).toHaveBeenCalledWith("case-error", "tab-error");
  });

  it("extracts parameters correctly from URL", async () => {
    const mockTabData = {
      _id: "param-test-case",
      caseRef: "PARAM-2024-001",
      links: [
        { id: "tasks", text: "Tasks", href: "/cases/case-456" },
        {
          id: "agreements",
          text: "Agreements",
          href: "/cases/case-456/timeline",
        },
      ],
    };

    findCaseTabUseCase.mockResolvedValue(mockTabData);

    const response = await server.inject({
      method: "GET",
      url: "/cases/param-test-case/agreements",
    });

    expect(response.statusCode).toBe(200);
    expect(findCaseTabUseCase).toHaveBeenCalledWith(
      "param-test-case",
      "agreements",
    );

    // Verify the view model was created correctly using the real function
    const expectedViewModel = createViewTabViewModel(mockTabData, "agreements");
    expect(expectedViewModel.pageTitle).toBe("Agreements PARAM-2024-001");
    expect(expectedViewModel.data._id).toBe("param-test-case");
  });
});

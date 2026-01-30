import { describe, expect, it, vi } from "vitest";
import { createViewTabViewModel } from "./view-tab.view-model.js";

vi.mock("../../common/view-models/header.view-model.js");

const mockRequest = { path: "/cases/agreement-123/case-details" };

const createMockPage = (tabData) => ({
  data: tabData,
  header: { navItems: [] },
});

describe("createViewTabViewModel", () => {
  const mockTabData = {
    _id: "agreement-123",
    caseRef: "AGR-2024-001",
    status: "Active",
    scheme: "Environmental Land Management",
    businessName: "Test Farm Ltd",
    links: [
      { id: "tasks", text: "Tasks", href: "/cases/agreement-123" },
      {
        id: "caseDetails",
        text: "Case Details",
        href: "/cases/agreement-123/case-details",
      },
      { id: "notes", text: "Notes", href: "/cases/agreement-123/notes" },
      {
        id: "timeline",
        text: "Timeline",
        href: "/cases/agreement-123/timeline",
      },
      {
        id: "agreements",
        text: "Agreements",
        href: "/cases/agreement-123/agreements",
      },
    ],
    payload: {
      answers: {
        agreementName: "Sustainable Farming Agreement",
        totalArea: 150,
      },
    },
  };

  it("creates view model with correct page title", () => {
    const result = createViewTabViewModel({
      page: createMockPage(mockTabData),
      request: mockRequest,
      tabId: "caseDetails",
    });

    expect(result.pageTitle).toBe("Case Details AGR-2024-001");
    expect(result.data.links.length).toBeGreaterThan(0);
    expect(result.data._id).toBe("agreement-123");
    expect(result.data.caseRef).toBe("AGR-2024-001");
    expect(result.data.status).toBe("Active");
    expect(result.data.scheme).toBe("Environmental Land Management");
    expect(result.data.businessName).toBe("Test Farm Ltd");
    expect(result.data.payload).toEqual(mockTabData.payload);
  });
});

describe("createViewTabViewModel with active tab", () => {
  const mockTabData = {
    _id: "agreement-123",
    caseRef: "AGR-2024-001",
    status: "Active",
    scheme: "Environmental Land Management",
    businessName: "Test Farm Ltd",
    links: [
      { id: "tasks", text: "Tasks", href: "/cases/agreement-123" },
      {
        id: "caseDetails",
        text: "Case Details",
        href: "/cases/agreement-123/case-details",
      },
      { id: "notes", text: "Notes", href: "/cases/agreement-123/notes" },
      {
        id: "timeline",
        href: "/cases/agreement-123/timeline",
      },
      {
        id: "agreements",
        text: "Agreements",
        href: "/cases/agreement-123/agreements",
      },
    ],
    payload: {
      answers: {
        agreementName: "Sustainable Farming Agreement",
        totalArea: 150,
      },
    },
  };

  it("creates view model with correct page title", () => {
    const result = createViewTabViewModel({
      page: createMockPage(mockTabData),
      request: { path: "/cases/agreement-123/timeline" },
      tabId: "timeline",
    });

    expect(result.pageTitle).toBe("timeline AGR-2024-001");
    expect(result.data.links.length).toBeGreaterThan(0);
    expect(result.data._id).toBe("agreement-123");
    expect(result.data.caseRef).toBe("AGR-2024-001");
    expect(result.data.status).toBe("Active");
    expect(result.data.scheme).toBe("Environmental Land Management");
    expect(result.data.businessName).toBe("Test Farm Ltd");
    expect(result.data.payload).toEqual(mockTabData.payload);
  });
});

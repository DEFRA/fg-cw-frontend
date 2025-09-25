import { load } from "cheerio";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer } from "../../../server/index.js";
import { findCaseTabUseCase } from "../../use-cases/find-case-tab.use-case.js";
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
      caseId: "68c2ced6713f9a0233a1a1ea",
      caseRef: "10f-f72-e22",
      tabId: "case-details",
      banner: {
        title: {
          text: "",
          type: "string",
        },
        summary: {
          sbi: {
            label: "SBI",
            text: "106284736",
            type: "string",
          },
          reference: {
            label: "Reference",
            text: "10f-f72-e22",
            type: "string",
          },
          scheme: {
            label: "Scheme",
            text: "SFI",
            type: "string",
          },
          createdAt: {
            label: "Created At",
            text: "11 Sept 2025",
            type: "date",
          },
        },
      },
      links: [
        {
          id: "tasks",
          text: "Tasks",
          href: "/cases/68c2ced6713f9a0233a1a1ea",
          active: false,
        },
        {
          id: "case-details",
          text: "Case Details",
          href: "/cases/68c2ced6713f9a0233a1a1ea/case-details",
          active: true,
        },
        {
          id: "notes",
          text: "Notes",
          href: "/cases/68c2ced6713f9a0233a1a1ea/notes",
          active: false,
        },
        {
          id: "timeline",
          text: "Timeline",
          href: "/cases/68c2ced6713f9a0233a1a1ea/timeline",
          active: false,
        },
        {
          id: "agreements",
          text: "Agreements",
          href: "/cases/68c2ced6713f9a0233a1a1ea/agreements",
          active: false,
        },
      ],
      content: [
        {
          id: "title",
          component: "heading",
          text: "Application",
          level: 2,
          classes: "govuk-!-margin-top-6 govuk-!-margin-bottom-1",
        },
        {
          id: "submittedDate",
          component: "container",
          classes: "govuk-body",
          items: [
            {
              text: "submitted:",
              classes: "govuk-!-font-weight-regular",
            },
            {
              text: "11 Sept 2025",
              classes: "govuk-!-font-weight-bold",
            },
          ],
        },
        {
          id: "answers",
          component: "summary-list",
          title: "Answers",
          type: "object",
          rows: [
            {
              text: "SFI",
              type: "string",
              label: "Scheme",
            },
            {
              text: 2025,
              type: "number",
              label: "Year",
            },
            {
              text: "Yes",
              type: "boolean",
              label: "Has checked land is up to date?",
            },
            {
              text: "NO_LONGER_REQUIRED",
              type: "string",
              label: "Agreement Name",
            },
          ],
        },
      ],
    };

    findCaseTabUseCase.mockResolvedValue(mockTabData);

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/cases/case-123/case-details",
    });

    expect(statusCode).toBe(200);
    expect(findCaseTabUseCase).toHaveBeenCalledWith("case-123", "case-details");

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });

  it("handles different tab types", async () => {
    const mockTimelineData = {
      _id: "case-456",
      caseRef: "TIM-2024-002",
      tabId: "timeline",
      banner: {
        title: {
          text: "",
          type: "string",
        },
        summary: {
          sbi: {
            label: "SBI",
            text: "106284736",
            type: "string",
          },
          reference: {
            label: "Reference",
            text: "10f-f72-e22",
            type: "string",
          },
          scheme: {
            label: "Scheme",
            text: "SFI",
            type: "string",
          },
          createdAt: {
            label: "Created At",
            text: "11 Sept 2025",
            type: "date",
          },
        },
      },
      links: [
        {
          id: "tasks",
          text: "Tasks",
          href: "/cases/68c2ced6713f9a0233a1a1ea",
          active: false,
        },
        {
          id: "case-details",
          text: "Case Details",
          href: "/cases/68c2ced6713f9a0233a1a1ea/case-details",
          active: true,
        },
        {
          id: "notes",
          text: "Notes",
          href: "/cases/68c2ced6713f9a0233a1a1ea/notes",
          active: false,
        },
        {
          id: "timeline",
          text: "Timeline",
          href: "/cases/68c2ced6713f9a0233a1a1ea/timeline",
          active: false,
        },
        {
          id: "agreements",
          text: "Agreements",
          href: "/cases/68c2ced6713f9a0233a1a1ea/agreements",
          active: false,
        },
      ],
      content: [
        {
          id: "title",
          component: "heading",
          text: "Timeline",
          level: 2,
          classes: "govuk-!-margin-top-6 govuk-!-margin-bottom-1",
        },
        {
          id: "submittedDate",
          component: "container",
          classes: "govuk-body",
          items: [
            {
              text: "submitted:",
              classes: "govuk-!-font-weight-regular",
            },
            {
              text: "11 Sept 2025",
              classes: "govuk-!-font-weight-bold",
            },
          ],
        },
      ],
    };

    findCaseTabUseCase.mockResolvedValue(mockTimelineData);

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/cases/case-456/timeline",
    });

    expect(statusCode).toBe(200);
    expect(findCaseTabUseCase).toHaveBeenCalledWith("case-456", "timeline");

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
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

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/cases/param-test-case/agreements",
    });

    expect(statusCode).toBe(200);
    expect(findCaseTabUseCase).toHaveBeenCalledWith(
      "param-test-case",
      "agreements",
    );

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });
});

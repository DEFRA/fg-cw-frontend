import Bell from "@hapi/bell";
import { load } from "cheerio";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer } from "../../../server/index.js";
import { findCaseTabUseCase } from "../../use-cases/find-case-tab.use-case.js";
import { viewCaseTabRoute } from "./view-case-tab.route.js";

vi.mock("../../use-cases/find-case-tab.use-case.js");

describe("viewCaseTabRoute", () => {
  let server;

  beforeEach(async () => {
    Bell.simulate(() => ({}));
    server = await createServer();
    server.route(viewCaseTabRoute);
  });

  afterEach(async () => {
    await server.stop();
    Bell.simulate(false);
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
              text: "2025",
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
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
        mode: "required",
      },
    });

    const authContext = {
      token: "mock-token",
      user: {},
    };

    expect(statusCode).toBe(200);
    expect(findCaseTabUseCase).toHaveBeenCalledWith(
      authContext,
      "case-123",
      "case-details",
      "",
    );

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
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
        mode: "required",
      },
    });

    const authContext = {
      token: "mock-token",
      user: {},
    };

    expect(statusCode).toBe(200);
    expect(findCaseTabUseCase).toHaveBeenCalledWith(
      authContext,
      "case-456",
      "timeline",
      "",
    );

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });

  it("forwards query string to use case", async () => {
    const mockTabData = {
      _id: "case-query",
      caseRef: "CASE-QUERY",
      tabId: "agreements",
      links: [
        { id: "tasks", text: "Tasks", href: "/cases/case-query" },
        {
          id: "agreements",
          text: "Agreements",
          href: "/cases/case-query/agreements",
        },
      ],
    };

    findCaseTabUseCase.mockResolvedValue(mockTabData);

    const { statusCode } = await server.inject({
      method: "GET",
      url: "/cases/case-query/agreements?runId=2",
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
        mode: "required",
      },
    });

    const authContext = {
      token: "mock-token",
      user: {},
    };

    expect(statusCode).toBe(200);
    expect(findCaseTabUseCase).toHaveBeenCalledWith(
      authContext,
      "case-query",
      "agreements",
      "runId=2",
    );
  });

  it("handles use case returning null", async () => {
    findCaseTabUseCase.mockResolvedValue(null);

    const response = await server.inject({
      method: "GET",
      url: "/cases/nonexistent/tab",
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
        mode: "required",
      },
    });

    const authContext = {
      token: "mock-token",
      user: {},
    };

    expect(response.statusCode).toBe(500);
    expect(findCaseTabUseCase).toHaveBeenCalledWith(
      authContext,
      "nonexistent",
      "tab",
      "",
    );
  });

  it("handles use case errors", async () => {
    const useCaseError = new Error("Database connection failed");
    findCaseTabUseCase.mockRejectedValue(useCaseError);

    const response = await server.inject({
      method: "GET",
      url: "/cases/case-error/tab-error",
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    const authContext = {
      token: "mock-token",
      user: {},
    };

    expect(response.statusCode).toBe(500);
    expect(findCaseTabUseCase).toHaveBeenCalledWith(
      authContext,
      "case-error",
      "tab-error",
      "",
    );
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
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    const authContext = {
      token: "mock-token",
      user: {},
    };

    expect(statusCode).toBe(200);
    expect(findCaseTabUseCase).toHaveBeenCalledWith(
      authContext,
      "param-test-case",
      "agreements",
      "",
    );

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });
});

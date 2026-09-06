import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { nunjucks } from "../../common/nunjucks/nunjucks.js";
import { reportCasesUseCase } from "../use-cases/report-cases.use-case.js";
import { reportRoute } from "./report.route.js";

vi.mock("../use-cases/report-cases.use-case.js");

const mockReport = {
  selectedCaseType: "woodland",
  availableCaseTypes: ["frps", "woodland"],
  total: 90,
  phases: [
    {
      code: "PRE_AWARD",
      name: "Pre-award",
      count: 90,
      stages: [
        {
          code: "REVIEW",
          name: "Review application",
          count: 90,
          statuses: [
            {
              code: "IN_PROGRESS",
              name: "In progress",
              theme: "INFO",
              count: 90,
            },
          ],
        },
      ],
    },
  ],
};

const createMockPage = (report) => ({
  data: report,
  header: { navItems: [] },
});

const inject = (server, url = "/reports") =>
  server.inject({
    method: "GET",
    url,
    auth: {
      credentials: { token: "mock-token" },
      strategy: "session",
    },
  });

describe("reportRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(reportRoute);
    await server.register([nunjucks]);
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("renders the lifecycle report table", async () => {
    reportCasesUseCase.mockResolvedValue(createMockPage(mockReport));

    const { statusCode, result } = await inject(server);

    expect(statusCode).toEqual(200);
    expect(result).toContain('data-testid="report-table"');
    expect(result).toContain("Pre-award");
    expect(result).toContain("Review application");
    expect(result).toContain("In progress");
    expect(result).toContain("Showing");

    const $ = load(result);
    const selectedOption = $("#workflowCode option[selected]");
    expect(selectedOption.attr("value")).toBe("woodland");
  });

  it("passes the workflowCode query through to the use case", async () => {
    reportCasesUseCase.mockResolvedValue(createMockPage(mockReport));

    await inject(server, "/reports?workflowCode=woodland");

    expect(reportCasesUseCase).toHaveBeenCalledWith(
      { token: "mock-token", user: undefined },
      { workflowCode: "woodland" },
    );
  });

  it("shows an empty message when no cases match", async () => {
    reportCasesUseCase.mockResolvedValue(
      createMockPage({
        selectedCaseType: "woodland",
        availableCaseTypes: ["woodland"],
        total: 0,
        phases: [],
      }),
    );

    const { statusCode, result } = await inject(server);

    expect(statusCode).toEqual(200);
    expect(result).toContain('data-testid="report-empty"');
    expect(result).toContain("No cases found");
  });

  it("prompts for a case type and shows no table on first visit", async () => {
    reportCasesUseCase.mockResolvedValue(
      createMockPage({
        selectedCaseType: null,
        availableCaseTypes: ["frps", "woodland"],
        total: 0,
        phases: [],
      }),
    );

    const { statusCode, result } = await inject(server);

    expect(statusCode).toEqual(200);
    expect(result).toContain('data-testid="report-prompt"');
    expect(result).toContain("Select a case type to view the report");
    expect(result).not.toContain('data-testid="report-table"');
    expect(result).not.toContain('data-testid="report-empty"');

    // The blank placeholder is the selected option.
    const $ = load(result);
    expect($("#workflowCode option[selected]").attr("value")).toBe("");
  });
});

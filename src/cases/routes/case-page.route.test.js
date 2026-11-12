import Boom from "@hapi/boom";
import Hapi from "@hapi/hapi";
import { load } from "cheerio";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { nunjucks } from "../../common/nunjucks/nunjucks.js";
import {
  findCaseGroupUseCase,
  findCasePageUseCase,
  saveCaseGroupUseCase,
} from "../use-cases/case-page.use-case.js";
import { casePageRoutes } from "./case-page.route.js";

vi.mock("../use-cases/case-page.use-case.js");
const base = "/types/frps-private-beta/pages/duplicates";
const groupUrl = `${base}/groups/${"a".repeat(64)}`;
const group = () => ({
  header: { navItems: [] },
  data: {
    details: { sbi: "123", businessName: "Farm" },
    canEdit: true,
    owner: null,
    users: [{ id: "owner-id", name: "Alex" }],
    cases: [
      {
        id: "case-a",
        caseRef: "300241",
        excluded: false,
        label: null,
        options: [
          { value: "", text: "Not set" },
          {
            value: JSON.stringify({ code: "NOT_DUPLICATE", data: null }),
            text: "Not duplicate",
          },
        ],
      },
      {
        id: "case-b",
        caseRef: "300242",
        excluded: true,
        status: "APPLICATION_REJECTED",
        label: null,
        options: [{ value: "", text: "Not set" }],
      },
    ],
  },
});
describe("dedupe case list routes", () => {
  let server;
  const request = (method, url, payload) =>
    server.inject({
      method,
      url,
      payload,
      auth: { strategy: "session", credentials: { token: "token", user: {} } },
    });
  beforeAll(async () => {
    server = Hapi.server();
    server.route(casePageRoutes);
    await server.register(nunjucks);
  });
  beforeEach(() => {
    findCaseGroupUseCase.mockResolvedValue(group());
  });
  afterAll(() => server.stop());
  it("renders the configured summary and dynamic components", async () => {
    findCasePageUseCase.mockResolvedValue({
      header: { navItems: [] },
      data: {
        pageType: "dedupe",
        title: "Clean the list",
        heading: "0 of 1 issues completed",
        rows: [
          {
            columns: {
              details: [
                { component: "url", text: "SBI 123: Farm", href: groupUrl },
                { component: "hint", text: "2 applications" },
              ],
            },
            assignee: { name: null },
            status: { text: "Not started", classes: "govuk-tag--blue" },
          },
        ],
      },
    });
    const response = await request("GET", base);
    expect(response.statusCode).toBe(200);
    const $ = load(response.result);
    expect($("h1").text()).toBe("Clean the list");
    expect($(`a[href='${groupUrl}']`).text()).toContain("SBI 123");
    expect($(".govuk-hint").text()).toContain("2 applications");
    expect($(".govuk-tag").text()).toContain("Not started");
  });
  it("renders case links, one save form, owner and read-only excluded labels", async () => {
    const response = await request("GET", groupUrl);
    expect(response.statusCode).toBe(200);
    const $ = load(response.result);
    expect($("form[method=POST]")).toHaveLength(1);
    expect($("#label-300241").attr("disabled")).toBeUndefined();
    expect($("#label-300242").attr("disabled")).toBeDefined();
    expect($("a[href='/cases/case-a']")).toHaveLength(1);
    expect($("#assignee option").last().text()).toBe("Alex");
  });
  it("keeps a historical label selected and hides write controls for read-only users", async () => {
    const page = group();
    page.data.canEdit = false;
    page.data.cases[0].label = {
      code: "DUPLICATE",
      data: { duplicateOf: "300242" },
    };
    findCaseGroupUseCase.mockResolvedValue(page);
    const response = await request("GET", groupUrl);
    const $ = load(response.result);
    expect($("#label-300241 option[selected]").text()).toContain(
      "historical target",
    );
    expect($("select:not([disabled])")).toHaveLength(0);
    expect($("button[type=submit]")).toHaveLength(0);
  });
  it("saves once and redirects to the summary", async () => {
    const form = { assignee: "owner-id", "label-300241": "" };
    const response = await request("POST", groupUrl, form);
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe(base);
    expect(saveCaseGroupUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ token: "token" }),
      expect.objectContaining({
        caseType: "frps-private-beta",
        pageKey: "duplicates",
      }),
      form,
    );
  });
  it("retains form choices and displays a refused-save error", async () => {
    saveCaseGroupUseCase.mockRejectedValue(
      Boom.badRequest("Duplicate target is no longer active"),
    );
    const response = await request("POST", groupUrl, {
      assignee: "owner-id",
      "label-300241": "",
    });
    expect(response.statusCode).toBe(400);
    const $ = load(response.result);
    expect($(".govuk-error-summary").text()).toContain(
      "Duplicate target is no longer active",
    );
    expect($("#assignee option[selected]").text()).toBe("Alex");
  });
});

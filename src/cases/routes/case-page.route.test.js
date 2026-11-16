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
const groupUrl = base + "/groups/opaque-route-key";
const group = () => ({
  header: { navItems: [] },
  data: {
    pageType: "dedupe",
    title: "Group supplied by backend",
    heading: "Group supplied by backend",
    intro: "Farm · 2 applications",
    backLink: { href: base, text: "Back to issues" },
    form: { id: "dedupe-review", action: groupUrl },
    ownerField: {
      id: "assignee",
      name: "assignee",
      label: { text: "Issue owner" },
      items: [
        { value: "", text: "Not set", selected: true },
        { value: "owner-id", text: "Alex" },
      ],
      disabled: false,
    },
    rows: [
      {
        caseLink: { href: "/cases/case-a", text: "300241" },
        note: null,
        labelField: {
          id: "label-300241",
          name: "label-300241",
          label: { text: "Label for case 300241" },
          items: [
            { value: "", text: "Not set", selected: true },
            { value: "opaque-choice-v1", text: "Label supplied by backend" },
          ],
          disabled: false,
        },
      },
      {
        caseLink: { href: "/cases/case-b", text: "300242" },
        note: "Backend-provided read-only explanation",
        labelField: {
          id: "label-300242",
          name: "label-300242",
          label: { text: "Label for case 300242" },
          items: [
            {
              value: "historical-token",
              text: "Backend-provided historical choice",
              selected: true,
            },
          ],
          disabled: true,
        },
      },
    ],
    saveButton: { text: "Save and continue" },
    errorList: [],
  },
});
describe("dedupe routes render backend BFF models", () => {
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
    saveCaseGroupUseCase.mockResolvedValue({ redirectHref: base });
  });
  afterAll(() => server.stop());
  it("renders the configured summary and dynamic content", async () => {
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
              assignee: [
                { component: "text", text: "Owner supplied by backend" },
              ],
              status: [
                {
                  component: "status",
                  text: "opaque-state",
                  labelsMap: { "opaque-state": "Status supplied by backend" },
                  classesMap: { "opaque-state": "govuk-tag--green" },
                },
              ],
            },
          },
        ],
      },
    });
    const response = await request("GET", base);
    expect(response.statusCode).toBe(200);
    const $ = load(response.result);
    expect($("h1").text()).toBe("Clean the list");
    expect($("a[href='" + groupUrl + "']").text()).toContain("SBI 123");
    expect($(".govuk-hint").text()).toContain("2 applications");
    expect($("tbody td").eq(1).text()).toContain("Owner supplied by backend");
    expect($(".govuk-tag").text().trim()).toBe("Status supplied by backend");
    expect($(".govuk-tag").attr("class")).toContain("govuk-tag--green");
    expect($(".govuk-tag").attr("class")).not.toContain("govuk-tag--grey");
  });
  it("renders opaque choices, links, headings, notes and disabled states exactly as supplied", async () => {
    const response = await request("GET", groupUrl);
    expect(response.statusCode).toBe(200);
    const $ = load(response.result);
    expect($("h1").text()).toBe("Group supplied by backend");
    expect($("form").attr("action")).toBe(groupUrl);
    expect($("#label-300241 option[value='opaque-choice-v1']").text()).toBe(
      "Label supplied by backend",
    );
    expect($("#label-300242").attr("disabled")).toBeDefined();
    expect($("#label-300242 option[selected]").text()).toBe(
      "Backend-provided historical choice",
    );
    expect($("a[href='/cases/case-a']")).toHaveLength(1);
    expect($(".govuk-hint").text()).toContain(
      "Backend-provided read-only explanation",
    );
  });
  it("hides save and disables fields when the BFF says so, without interpreting domain flags", async () => {
    const page = group();
    page.data.saveButton = null;
    page.data.ownerField.disabled = true;
    page.data.rows.forEach((row) => {
      row.labelField.disabled = true;
    });
    findCaseGroupUseCase.mockResolvedValue(page);
    const response = await request("GET", groupUrl);
    const $ = load(response.result);
    expect($("select:not([disabled])")).toHaveLength(0);
    expect($("button[type=submit]")).toHaveLength(0);
  });
  it("submits the raw form and follows the backend's navigation", async () => {
    const form = { assignee: "owner-id", "label-300241": "opaque-choice-v1" };
    const response = await request("POST", groupUrl, form);
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe(base);
    expect(saveCaseGroupUseCase).toHaveBeenCalledWith(
      expect.objectContaining({ token: "token" }),
      expect.objectContaining({ groupKey: "opaque-route-key" }),
      form,
    );
  });
  it("uses the complete backend validation model without a second GET or invented options", async () => {
    const page = group();
    page.data.errorList = [
      { text: "Backend validation message", href: "#label-300241" },
    ];
    page.data.rows[0].labelField.items = [
      {
        value: "stored-token",
        text: "Stored choice from backend",
        selected: true,
      },
    ];
    const error = Boom.badRequest("Validation failed");
    error.data = { payload: { page, message: "Backend validation message" } };
    saveCaseGroupUseCase.mockRejectedValue(error);
    const response = await request("POST", groupUrl, {
      assignee: "owner-id",
      "label-300241": "invalid-submitted-value",
    });
    expect(response.statusCode).toBe(400);
    expect(findCaseGroupUseCase).not.toHaveBeenCalled();
    const $ = load(response.result);
    expect($(".govuk-error-summary a").attr("href")).toBe("#label-300241");
    expect($("#label-300241 option[selected]").text()).toBe(
      "Stored choice from backend",
    );
    expect(response.result).not.toContain("invalid-submitted-value");
  });
});

import hapi from "@hapi/hapi";
import Yar from "@hapi/yar";
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
import { findCaseByIdUseCase } from "../../cases/use-cases/find-case-by-id.use-case.js";
import { nunjucks } from "../../common/nunjucks/nunjucks.js";
import {
  apiComponentsUploadRoute,
  submitComponentsUploadRoute,
  viewComponentsRoute,
  viewComponentsUploadRoute,
} from "./components.route.js";

vi.mock("../../cases/use-cases/find-case-by-id.use-case.js");

const mockCase = {
  _id: "68dd18bb4ca4d679a9bb3c1d",
  caseRef: "CASE-123",
  banner: {
    title: {
      value: "Case summary",
    },
    summary: {
      sbi: {
        label: "SBI",
        text: "123456789",
      },
    },
  },
  links: [
    {
      id: "tasks",
      text: "Tasks",
      href: "/cases/68dd18bb4ca4d679a9bb3c1d",
    },
  ],
};

const registerSessionPlugin = {
  plugin: Yar,
  options: {
    name: "session",
    cookieOptions: {
      password: "abcdefghijklmnopqrstuvwxyz012345",
      isSecure: false,
      isSameSite: "Strict",
    },
  },
};

describe("temp components routes", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route([
      viewComponentsRoute,
      viewComponentsUploadRoute,
      submitComponentsUploadRoute,
      apiComponentsUploadRoute,
    ]);
    await server.register([nunjucks, registerSessionPlugin]);
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  beforeEach(() => {
    findCaseByIdUseCase.mockReset();
    findCaseByIdUseCase.mockResolvedValue(mockCase);
  });

  const componentsPath = "/cases/68dd18bb4ca4d679a9bb3c1d/components";
  const editPath = "/cases/68dd18bb4ca4d679a9bb3c1d/components/edit";
  const apiPath = "/cases/68dd18bb4ca4d679a9bb3c1d/components/api";

  it("renders the upload form", async () => {
    const { statusCode, result } = await server.inject({
      method: "GET",
      url: editPath,
    });

    expect(statusCode).toEqual(200);
    expect(findCaseByIdUseCase).toHaveBeenCalledWith(
      "68dd18bb4ca4d679a9bb3c1d",
    );

    const $ = load(result);
    expect($("#jsonPayload").length).toEqual(1);
    expect($("form").attr("action")).toEqual(editPath);
    expect($(".govuk-service-navigation__link").text()).toContain("Components");
  });

  it("returns validation errors for invalid JSON", async () => {
    const { statusCode, result } = await server.inject({
      method: "POST",
      url: editPath,
      payload: {
        jsonPayload: "{not-json}",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    expect($(".govuk-error-summary").length).toEqual(1);
    expect($(".govuk-error-message").text()).toContain(
      "Enter a valid JSON payload",
    );
  });

  it("stores parsed content in session and serves the components page", async () => {
    const payload = `
      [
        {
          component: 'paragraph',
          text: 'Loose JSON'
        }
      ]
    `;

    const postResponse = await server.inject({
      method: "POST",
      url: editPath,
      payload: {
        jsonPayload: payload,
      },
    });

    expect(postResponse.statusCode).toEqual(302);
    expect(postResponse.headers.location).toEqual(componentsPath);

    const cookie = postResponse.headers["set-cookie"][0].split(";")[0];

    const getResponse = await server.inject({
      method: "GET",
      url: componentsPath,
      headers: {
        cookie,
      },
    });

    expect(getResponse.statusCode).toEqual(200);

    const $ = load(getResponse.result);
    expect($(".govuk-service-navigation__link").text()).toContain("Components");
    expect($("#main-content").text()).toContain("Loose JSON");
  });

  it("shows a message when no components are available", async () => {
    const { statusCode, result } = await server.inject({
      method: "GET",
      url: componentsPath,
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    const text = $("#main-content").text();
    expect(text).toContain("You have not defined any dynamic components.");
    expect(text).toContain("Go to Components edit page.");
  });

  it("accepts component payload via API and stores it", async () => {
    const response = await server.inject({
      method: "POST",
      url: apiPath,
      payload: [
        {
          component: "paragraph",
          text: "Posted via API",
        },
      ],
    });

    expect(response.statusCode).toEqual(202);
    expect(JSON.parse(response.payload)).toEqual({
      message: "Components stored successfully",
      componentsPath,
    });

    const cookie = response.headers["set-cookie"]?.[0]?.split(";")[0];

    const pageResponse = await server.inject({
      method: "GET",
      url: componentsPath,
      headers: {
        cookie,
      },
    });

    expect(pageResponse.statusCode).toEqual(200);
    const $ = load(pageResponse.result);
    expect($("#main-content").text()).toContain("Posted via API");
  });

  it("returns validation errors for invalid API payload", async () => {
    const response = await server.inject({
      method: "POST",
      url: apiPath,
      payload: {
        invalid: true,
      },
    });

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.payload)).toEqual({
      errors: {
        jsonPayload: "JSON payload must be an array of components",
      },
    });
  });
});

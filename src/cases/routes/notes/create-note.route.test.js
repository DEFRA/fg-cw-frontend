import Boom from "@hapi/boom";
import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createMockCaseData } from "../../../../test/data/case-test-data.js";
import { nunjucks } from "../../../common/nunjucks/nunjucks.js";
import { addNoteToCaseUseCase } from "../../use-cases/add-note-to-case.use-case.js";
import { findCaseByIdUseCase } from "../../use-cases/find-case-by-id.use-case.js";
import { createNoteRoute } from "./create-note.route.js";

vi.mock("../../use-cases/find-case-by-id.use-case.js");
vi.mock("../../use-cases/add-note-to-case.use-case.js");
vi.mock("../../../common/view-models/header.view-model.js");

const createMockPage = (caseData) => ({
  data: caseData,
  header: { navItems: [] },
});

describe("createNoteRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(createNoteRoute);
    await server.register([nunjucks]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("calls use case and redirects on successful submission", async () => {
    addNoteToCaseUseCase.mockResolvedValue();

    const { statusCode, headers } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/notes",
      payload: {
        text: "This is a valid note",
      },
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

    expect(addNoteToCaseUseCase).toHaveBeenCalledWith(authContext, {
      caseId: "68495db5afe2d27b09b2ee47",
      text: "This is a valid note",
    });

    expect(statusCode).toEqual(302);
    expect(headers.location).toEqual("/cases/68495db5afe2d27b09b2ee47/notes");
  });

  it("shows validation error when text is empty", async () => {
    const mockCaseData = createMockCaseData();
    findCaseByIdUseCase.mockResolvedValue(createMockPage(mockCaseData));

    const { statusCode, result } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/notes",
      payload: {
        text: "",
      },
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

    expect(findCaseByIdUseCase).toHaveBeenCalledWith(
      authContext,
      "68495db5afe2d27b09b2ee47",
    );
    expect(addNoteToCaseUseCase).not.toHaveBeenCalled();
    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });

  it("shows validation error when text is only whitespace", async () => {
    const mockCaseData = createMockCaseData();
    findCaseByIdUseCase.mockResolvedValue(createMockPage(mockCaseData));

    const { statusCode, result } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/notes",
      payload: {
        text: "   \n\t  ",
      },
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

    expect(findCaseByIdUseCase).toHaveBeenCalledWith(
      authContext,
      "68495db5afe2d27b09b2ee47",
    );
    expect(addNoteToCaseUseCase).not.toHaveBeenCalled();
    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });

  it("shows validation error when text is missing", async () => {
    const mockCaseData = createMockCaseData();
    findCaseByIdUseCase.mockResolvedValue(createMockPage(mockCaseData));

    const { statusCode, result } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/notes",
      payload: {
        // text is missing
      },
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

    expect(findCaseByIdUseCase).toHaveBeenCalledWith(
      authContext,
      "68495db5afe2d27b09b2ee47",
    );
    expect(addNoteToCaseUseCase).not.toHaveBeenCalled();
    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });

  it("shows save error when save fails", async () => {
    const mockCaseData = createMockCaseData();
    findCaseByIdUseCase.mockResolvedValue(createMockPage(mockCaseData));
    addNoteToCaseUseCase.mockRejectedValue(new Error("API Error"));

    const { statusCode, result } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/notes",
      payload: {
        text: "This will fail to save",
      },
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

    expect(addNoteToCaseUseCase).toHaveBeenCalledWith(authContext, {
      caseId: "68495db5afe2d27b09b2ee47",
      text: "This will fail to save",
    });

    expect(findCaseByIdUseCase).toHaveBeenCalledWith(
      authContext,
      "68495db5afe2d27b09b2ee47",
    );
    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });

  it("returns 403 when backend forbids saving", async () => {
    addNoteToCaseUseCase.mockRejectedValue(Boom.forbidden("Forbidden"));

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/notes",
      payload: {
        text: "This will be forbidden",
      },
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(403);
  });
});

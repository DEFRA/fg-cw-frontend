import hapi from "@hapi/hapi";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { setFlashNotification } from "../../common/helpers/flash-helpers.js";
import { triggerPageActionUseCase } from "../use-cases/trigger-page-action.use-case.js";
import { pageActionRoute } from "./page-action.route.js";

vi.mock("../../common/helpers/flash-helpers.js");
vi.mock("../use-cases/trigger-page-action.use-case.js");

describe("pageActionRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(pageActionRoute);
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should trigger page action successfully", async () => {
    triggerPageActionUseCase.mockResolvedValueOnce({});

    const { statusCode, headers } = await server.inject(createMockRequest());

    expect(statusCode).toBe(302);
    expect(headers.location).toBe("/cases/case-123");

    expect(triggerPageActionUseCase).toHaveBeenCalledWith(
      {
        token: "mock-token",
        user: {
          appRoles: ["caseworker"],
        },
      },
      {
        caseId: "case-123",
        actionCode: "RECALCULATE_RULES",
      },
    );

    expect(setFlashNotification).toHaveBeenCalledWith(expect.any(Object), {
      variant: "success",
      title: "Action completed",
      text: "Rerun Rules completed successfully",
    });
  });

  it("should handle different action codes", async () => {
    triggerPageActionUseCase.mockResolvedValueOnce({});

    await server.inject(
      createMockRequest({
        payload: {
          actionCode: "FETCH_RULES",
          actionName: "Fetch Rules",
        },
      }),
    );

    expect(triggerPageActionUseCase).toHaveBeenCalledWith(
      {
        token: "mock-token",
        user: {
          appRoles: ["caseworker"],
        },
      },
      {
        caseId: "case-123",
        actionCode: "FETCH_RULES",
      },
    );

    expect(setFlashNotification).toHaveBeenCalledWith(expect.any(Object), {
      variant: "success",
      title: "Action completed",
      text: "Fetch Rules completed successfully",
    });
  });

  it("should handle use case errors", async () => {
    const error = new Error("External action not found");
    triggerPageActionUseCase.mockRejectedValueOnce(error);

    const { statusCode, headers } = await server.inject(createMockRequest());

    expect(statusCode).toBe(302);
    expect(headers.location).toBe("/cases/case-123");

    expect(setFlashNotification).toHaveBeenCalledWith(expect.any(Object), {
      variant: "error",
      title: "There is a problem right now",
      text: "Try again later.",
      showTitleAsHeading: true,
    });
  });

  it("should handle use case errors without message", async () => {
    const error = new Error();
    triggerPageActionUseCase.mockRejectedValueOnce(error);

    await server.inject(createMockRequest());

    expect(setFlashNotification).toHaveBeenCalledWith(expect.any(Object), {
      variant: "error",
      title: "There is a problem right now",
      text: "Try again later.",
      showTitleAsHeading: true,
    });
  });

  it("should redirect to referer when available", async () => {
    triggerPageActionUseCase.mockResolvedValueOnce({});

    const { statusCode, headers } = await server.inject(
      createMockRequest({
        headers: {
          referer: "/cases/case-123/tabs/details",
        },
      }),
    );

    expect(statusCode).toBe(302);
    expect(headers.location).toBe("/cases/case-123/tabs/details");
  });

  it("should redirect to case detail when no referer", async () => {
    triggerPageActionUseCase.mockResolvedValueOnce({});

    const { statusCode, headers } = await server.inject(
      createMockRequest({
        headers: {},
      }),
    );

    expect(statusCode).toBe(302);
    expect(headers.location).toBe("/cases/case-123");
  });

  it("should use fallback message when actionName is missing on success", async () => {
    triggerPageActionUseCase.mockResolvedValueOnce({});

    await server.inject(
      createMockRequest({
        payload: {
          actionCode: "RECALCULATE_RULES",
        },
      }),
    );

    expect(setFlashNotification).toHaveBeenCalledWith(expect.any(Object), {
      variant: "success",
      title: "Action completed",
      text: "Action completed successfully",
    });
  });

  it("should use fallback message when actionName is missing on error", async () => {
    const error = new Error("Something went wrong");
    triggerPageActionUseCase.mockRejectedValueOnce(error);

    await server.inject(
      createMockRequest({
        payload: {
          actionCode: "RECALCULATE_RULES",
        },
      }),
    );

    expect(setFlashNotification).toHaveBeenCalledWith(expect.any(Object), {
      variant: "error",
      title: "There is a problem right now",
      text: "Try again later.",
      showTitleAsHeading: true,
    });
  });
});

const createMockRequest = (overrides = {}) => ({
  method: "POST",
  url: "/cases/case-123/page-action",
  payload: {
    actionCode: "RECALCULATE_RULES",
    actionName: "Rerun Rules",
  },
  headers: {
    referer: "/cases/case-123",
  },
  auth: {
    credentials: {
      token: "mock-token",
      user: {
        appRoles: ["caseworker"],
      },
    },
    strategy: "session",
  },
  ...overrides,
});

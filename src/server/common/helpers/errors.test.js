import { beforeEach, describe, expect, it, vi } from "vitest";
import { logger } from "../../../common/logger.js";
import { catchAll } from "./errors.js";

vi.mock("../../../common/logger.js");

describe("catchAll", () => {
  let mockResponseToolkit;

  beforeEach(() => {
    mockResponseToolkit = {
      view: vi.fn().mockReturnThis(),
      code: vi.fn().mockReturnThis(),
      continue: Symbol("continue"),
    };
  });

  it("should pass through if response is not Boom", () => {
    const requestWithNonBoomResponse = {
      response: {},
    };

    const result = catchAll(requestWithNonBoomResponse, mockResponseToolkit);

    expect(result).toBe(mockResponseToolkit.continue);
    expect(mockResponseToolkit.view).not.toHaveBeenCalled();
    expect(mockResponseToolkit.code).not.toHaveBeenCalled();
  });

  it("should render error page for Boom responses with appropriate status code and message", () => {
    const requestWithBoomResponse = {
      response: {
        isBoom: true,
        output: {
          statusCode: 404,
        },
      },
    };

    catchAll(requestWithBoomResponse, mockResponseToolkit);

    expect(mockResponseToolkit.view).toHaveBeenCalledWith("error/index", {
      pageTitle: "Page not found",
      heading: 404,
      message: "Page not found",
    });
    expect(mockResponseToolkit.code).toHaveBeenCalledWith(404);
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("should log error stack for status codes >= 500", () => {
    const errorStack = "Some error stack";
    const requestWithServerErrorResponse = {
      response: {
        isBoom: true,
        stack: errorStack,
        output: {
          statusCode: 500,
        },
      },
    };

    catchAll(requestWithServerErrorResponse, mockResponseToolkit);

    expect(logger.error).toHaveBeenCalledWith(errorStack);
    expect(mockResponseToolkit.view).toHaveBeenCalledWith("error/index", {
      pageTitle: "Something went wrong",
      heading: 500,
      message: "Something went wrong",
    });
    expect(mockResponseToolkit.code).toHaveBeenCalledWith(500);
  });

  it("should default to a generic message for unknown status codes", () => {
    const requestWithUnknownError = {
      response: {
        isBoom: true,
        output: {
          statusCode: 418,
        },
      },
    };

    catchAll(requestWithUnknownError, mockResponseToolkit);

    expect(mockResponseToolkit.view).toHaveBeenCalledWith("error/index", {
      pageTitle: "Something went wrong",
      heading: 418,
      message: "Something went wrong",
    });
    expect(mockResponseToolkit.code).toHaveBeenCalledWith(418);
    expect(logger.error).not.toHaveBeenCalled();
  });
});

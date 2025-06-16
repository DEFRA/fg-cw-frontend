import { beforeEach, describe, expect, it, vi } from "vitest";
import { catchAll } from "./errors.js";

describe("catchAll", () => {
  let mockResponseToolkit;
  let mockRequest;

  beforeEach(() => {
    mockResponseToolkit = {
      view: vi.fn().mockReturnThis(),
      code: vi.fn().mockReturnThis(),
      continue: Symbol("continue"),
    };
    mockRequest = {
      logger: {
        error: vi.fn(),
        info: vi.fn(),
      },
    };
  });

  it("should pass through if response is not Boom", () => {
    const requestWithNonBoomResponse = {
      ...mockRequest,
      response: {},
    };

    const result = catchAll(requestWithNonBoomResponse, mockResponseToolkit);

    expect(result).toBe(mockResponseToolkit.continue);
    expect(mockResponseToolkit.view).not.toHaveBeenCalled();
    expect(mockResponseToolkit.code).not.toHaveBeenCalled();
  });

  it("should render error page for Boom responses with appropriate status code and message", () => {
    const requestWithBoomResponse = {
      ...mockRequest,
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
    expect(mockRequest.logger.error).not.toHaveBeenCalled();
  });

  it("should log error stack for status codes >= 500", () => {
    const errorStack = "Some error stack";
    const requestWithServerErrorResponse = {
      ...mockRequest,
      response: {
        isBoom: true,
        stack: errorStack,
        output: {
          statusCode: 500,
        },
      },
    };

    catchAll(requestWithServerErrorResponse, mockResponseToolkit);

    expect(mockRequest.logger.error).toHaveBeenCalledWith(errorStack);
    expect(mockResponseToolkit.view).toHaveBeenCalledWith("error/index", {
      pageTitle: "Something went wrong",
      heading: 500,
      message: "Something went wrong",
    });
    expect(mockResponseToolkit.code).toHaveBeenCalledWith(500);
  });

  it("should default to a generic message for unknown status codes", () => {
    const requestWithUnknownError = {
      ...mockRequest,
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
    expect(mockRequest.logger.error).not.toHaveBeenCalled();
  });
});

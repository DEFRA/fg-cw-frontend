import hapi from "@hapi/hapi";
import Yar from "@hapi/yar";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { updateTaskStatusUseCase } from "../use-cases/update-task-status.use-case.js";
import { updateTaskStatusRoute } from "./update-task-status.route.js";

vi.mock("../use-cases/find-case-by-id.use-case.js");
vi.mock("../use-cases/update-task-status.use-case.js");

describe("updateTaskStatusRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    await server.register({
      plugin: Yar,
      options: {
        name: "session",
        cookieOptions: {
          password: "abcdefghijklmnopqrstuvwxyz012345",
          isSecure: false,
          isSameSite: "Strict",
        },
      },
    });

    server.route([updateTaskStatusRoute]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("throws if comment is required", async () => {
    findCaseByIdUseCase.mockResolvedValueOnce({
      data: {
        stage: {
          code: "001",
          taskGroups: [
            {
              code: "tg01",
              tasks: [
                {
                  code: "t01",
                  valueOptions: [{ code: "approved" }],
                  commentInputDef: {
                    mandatory: true,
                  },
                },
              ],
            },
          ],
        },
      },
      header: { navItems: [] },
    });

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/task-groups/tg01/tasks/t01/value",
      payload: {
        completed: true,
        value: "approved",
      },
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    expect(updateTaskStatusUseCase).not.toHaveBeenCalled();
    expect(statusCode).toEqual(302);
  });

  it("updates the task value with no comment", async () => {
    findCaseByIdUseCase.mockResolvedValueOnce({
      data: {
        stage: {
          code: "001",
          taskGroups: [
            {
              code: "tg01",
              tasks: [
                {
                  code: "t01",
                  valueOptions: [{ code: "approved" }],
                  commentInputDef: {
                    mandatory: false,
                  },
                },
              ],
            },
          ],
        },
      },
      header: { navItems: [] },
    });

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/task-groups/tg01/tasks/t01/value",
      payload: {
        completed: true,
        value: "approved",
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

    expect(updateTaskStatusUseCase).toHaveBeenCalledWith(authContext, {
      caseId: "68495db5afe2d27b09b2ee47",
      taskGroupCode: "tg01",
      taskCode: "t01",
      completed: true,
      value: "approved",
      comment: null,
    });

    expect(statusCode).toEqual(302);
  });

  it("updates the task value with comment if required", async () => {
    findCaseByIdUseCase.mockResolvedValueOnce({
      data: {
        stage: {
          code: "001",
          taskGroups: [
            {
              code: "tg01",
              tasks: [
                {
                  code: "t01",
                  valueOptions: [{ code: "approved" }],
                  commentInputDef: {
                    mandatory: true,
                  },
                },
              ],
            },
          ],
        },
      },
      header: { navItems: [] },
    });

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/task-groups/tg01/tasks/t01/value",
      payload: {
        completed: true,
        value: "approved",
        "approved-comment": "This is a comment",
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

    expect(updateTaskStatusUseCase).toHaveBeenCalledWith(authContext, {
      caseId: "68495db5afe2d27b09b2ee47",
      taskGroupCode: "tg01",
      taskCode: "t01",
      completed: true,
      value: "approved",
      comment: "This is a comment",
    });

    expect(statusCode).toEqual(302);
  });

  it("updates with value but completed=false", async () => {
    findCaseByIdUseCase.mockResolvedValueOnce({
      data: {
        stage: {
          code: "001",
          taskGroups: [
            {
              code: "tg01",
              tasks: [
                {
                  code: "t01",
                  valueOptions: [{ code: "on-hold" }],
                  commentInputDef: null,
                },
              ],
            },
          ],
        },
      },
      header: { navItems: [] },
    });

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/task-groups/tg01/tasks/t01/value",
      payload: {
        completed: false,
        value: "on-hold",
      },
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    expect(updateTaskStatusUseCase).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        completed: false,
        value: "on-hold",
      }),
    );

    expect(statusCode).toEqual(302);
  });

  it("handles empty string comment correctly", async () => {
    findCaseByIdUseCase.mockResolvedValueOnce({
      data: {
        stage: {
          code: "001",
          taskGroups: [
            {
              code: "tg01",
              tasks: [
                {
                  code: "t01",
                  valueOptions: [{ code: "approved" }],
                  commentInputDef: {
                    mandatory: false,
                  },
                },
              ],
            },
          ],
        },
      },
      header: { navItems: [] },
    });

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/task-groups/tg01/tasks/t01/value",
      payload: {
        completed: true,
        value: "approved",
        "approved-comment": "",
      },
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    expect(updateTaskStatusUseCase).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        comment: null,
      }),
    );

    expect(statusCode).toEqual(302);
  });

  it("validates when task has no commentInputDef", async () => {
    findCaseByIdUseCase.mockResolvedValueOnce({
      data: {
        stage: {
          code: "001",
          taskGroups: [
            {
              code: "tg01",
              tasks: [
                {
                  code: "t01",
                  valueOptions: [{ code: "approved" }],
                  // No commentInputDef
                },
              ],
            },
          ],
        },
      },
      header: { navItems: [] },
    });

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/task-groups/tg01/tasks/t01/value",
      payload: {
        completed: true,
        value: "approved",
      },
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    // Should not throw error for missing commentInputDef
    expect(updateTaskStatusUseCase).toHaveBeenCalled();
    expect(statusCode).toEqual(302);
  });

  it("rejects when mandatory comment is undefined (not just empty)", async () => {
    findCaseByIdUseCase.mockResolvedValueOnce({
      data: {
        stage: {
          code: "001",
          taskGroups: [
            {
              code: "tg01",
              tasks: [
                {
                  code: "t01",
                  valueOptions: [{ code: "approved" }],
                  commentInputDef: {
                    mandatory: true,
                  },
                },
              ],
            },
          ],
        },
      },
      header: { navItems: [] },
    });

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/task-groups/tg01/tasks/t01/value",
      payload: {
        completed: true,
        value: "approved",
        // comment is undefined (not sent)
      },
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    expect(updateTaskStatusUseCase).not.toHaveBeenCalled();
    expect(statusCode).toEqual(302); // Redirects back to form
  });

  it("rejects when value is required but missing", async () => {
    findCaseByIdUseCase.mockResolvedValueOnce({
      data: {
        stage: {
          code: "001",
          taskGroups: [
            {
              code: "tg01",
              tasks: [
                {
                  code: "t01",
                  valueOptions: [{ code: "approved" }, { code: "rejected" }],
                  commentInputDef: null,
                },
              ],
            },
          ],
        },
      },
      header: { navItems: [] },
    });

    const { statusCode } = await server.inject({
      method: "POST",
      url: "/cases/68495db5afe2d27b09b2ee47/task-groups/tg01/tasks/t01/value",
      payload: {
        completed: true,
      },
      auth: {
        credentials: {
          token: "mock-token",
          user: {},
        },
        strategy: "session",
      },
    });

    expect(updateTaskStatusUseCase).not.toHaveBeenCalled();
    expect(statusCode).toEqual(302);
  });

  describe("input tasks", () => {
    const mockInputTask = ({ input, mandatory = true }) => {
      findCaseByIdUseCase.mockResolvedValueOnce({
        data: {
          stage: {
            code: "001",
            taskGroups: [
              {
                code: "tg01",
                tasks: [
                  {
                    code: "t01",
                    valueOptions: [],
                    mandatory,
                    input,
                    // Backend still sends this for input tasks; the route must
                    // ignore it rather than demand a comment.
                    commentInputDef: { mandatory: true, label: "Explanation" },
                  },
                ],
              },
            ],
          },
        },
        header: { navItems: [] },
      });
    };

    const submit = (payload) =>
      server.inject({
        method: "POST",
        url: "/cases/68495db5afe2d27b09b2ee47/task-groups/tg01/tasks/t01/value",
        payload,
        auth: {
          credentials: { token: "mock-token", user: {} },
          strategy: "session",
        },
      });

    const authContext = { token: "mock-token", user: {} };
    const caseUrl = "/cases/68495db5afe2d27b09b2ee47";
    const taskUrl = `${caseUrl}/tasks/tg01/t01`;
    const textInput = { type: "text", label: "Reference", maxlength: 8 };
    const numberInput = {
      type: "number",
      label: "Herd size",
      min: 1,
      max: 5000,
    };
    const dateInput = { type: "date", label: "Date of last inspection" };

    it.each([
      ["text", textInput, "SF123456"],
      ["number", numberInput, "1200"],
      ["date", dateInput, "2026-03-27"],
    ])("submits a valid %s value", async (_type, input, value) => {
      mockInputTask({ input });

      const { statusCode, headers } = await submit({ value });

      expect(updateTaskStatusUseCase).toHaveBeenCalledWith(authContext, {
        caseId: "68495db5afe2d27b09b2ee47",
        taskGroupCode: "tg01",
        taskCode: "t01",
        completed: false,
        value,
        comment: null,
      });
      expect(statusCode).toEqual(302);
      expect(headers.location).toBe(caseUrl);
    });

    it.each([
      ["over maxlength", textInput, "TOOMANYCHARS"],
      ["failing the pattern", { ...textInput, pattern: "[0-9]{6}" }, "abc"],
      [
        "not matching the whole pattern",
        { ...textInput, pattern: "[0-9]{6}" },
        "x123456x",
      ],
      ["below min", numberInput, "0"],
      ["above max", numberInput, "5001"],
      ["not a number", numberInput, "abc"],
      // Number() would take these as 16 and 1000; the value is stored as typed,
      // so the field would come back reading "0x10".
      ["a hexadecimal number", numberInput, "0x10"],
      ["a number in exponent form", numberInput, "1e3"],
      ["a malformed date", dateInput, "27-03-2026"],
      ["a date that does not exist", dateInput, "2026-02-30"],
    ])("rejects a value %s", async (_case, input, value) => {
      mockInputTask({ input });

      const { statusCode, headers } = await submit({ value });

      expect(updateTaskStatusUseCase).not.toHaveBeenCalled();
      expect(statusCode).toEqual(302);
      // Back to the task, not on to the case - the value was not accepted.
      expect(headers.location).toBe(taskUrl);
    });

    it.each([
      ["an empty", ""],
      // Spaces would otherwise skip the mandatory check and store as blanks
      // that redisplay as a filled-in field.
      ["a whitespace-only", "   "],
    ])("rejects %s value on a mandatory task", async (_case, value) => {
      mockInputTask({ input: textInput, mandatory: true });

      const { statusCode, headers } = await submit({ value });

      expect(updateTaskStatusUseCase).not.toHaveBeenCalled();
      expect(statusCode).toEqual(302);
      expect(headers.location).toBe(taskUrl);
    });

    it("trims surrounding whitespace from a submitted value", async () => {
      mockInputTask({ input: textInput });

      await submit({ value: "  SF12345  " });

      expect(updateTaskStatusUseCase).toHaveBeenCalledWith(
        authContext,
        expect.objectContaining({ value: "SF12345" }),
      );
    });

    it("clears an optional value submitted as whitespace", async () => {
      mockInputTask({ input: textInput, mandatory: false });

      await submit({ value: "   " });

      expect(updateTaskStatusUseCase).toHaveBeenCalledWith(
        authContext,
        expect.objectContaining({ value: null }),
      );
    });

    // An emptied field posts "", but the API rejects "" - it must reach the
    // use case as null so the value is cleared and the task un-completed.
    it("clears an optional value by sending null rather than an empty string", async () => {
      mockInputTask({ input: textInput, mandatory: false });

      const { statusCode, headers } = await submit({ value: "" });

      expect(headers.location).toBe(caseUrl);
      expect(updateTaskStatusUseCase).toHaveBeenCalledWith(authContext, {
        caseId: "68495db5afe2d27b09b2ee47",
        taskGroupCode: "tg01",
        taskCode: "t01",
        completed: false,
        value: null,
        comment: null,
      });
      expect(statusCode).toEqual(302);
    });

    it("does not require a comment even though commentInputDef is mandatory", async () => {
      mockInputTask({ input: textInput });

      await submit({ value: "SF123456" });

      expect(updateTaskStatusUseCase).toHaveBeenCalledWith(
        authContext,
        expect.objectContaining({ value: "SF123456", comment: null }),
      );
    });

    it("ignores a client-supplied completed flag", async () => {
      mockInputTask({ input: textInput, mandatory: false });

      await submit({ value: "SF123456", completed: true });

      expect(updateTaskStatusUseCase).toHaveBeenCalledWith(
        authContext,
        expect.objectContaining({ value: "SF123456" }),
      );
    });
  });
});

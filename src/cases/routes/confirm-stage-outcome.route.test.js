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
import {
  getFlashData,
  setFlashData,
} from "../../common/helpers/flash-helpers.js";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { updateStageOutcomeUseCase } from "../use-cases/update-stage-outcome-use.case.js";
import { createConfirmStageOutcomeViewModel } from "../view-models/confirm-stage-outcome.view-model.js";
import {
  confirmStageOutcomeRoute,
  viewConfirmStageOutcomeRoute,
} from "./confirm-stage-outcome.route.js";

vi.mock("../../common/helpers/flash-helpers.js");
vi.mock("../use-cases/find-case-by-id.use-case.js");
vi.mock("../use-cases/update-stage-outcome-use.case.js");
vi.mock("../view-models/confirm-stage-outcome.view-model.js");

describe("confirmStageOutcomeRoute", () => {
  let server;

  const mockCaseData = {
    data: {
      _id: "case-123",
      caseRef: "CASE-REF-123",
      stage: {
        actions: [
          {
            code: "REJECT_APPLICATION",
            name: "Reject",
            confirm: {
              details: [],
              yes: null,
              no: null,
            },
          },
        ],
      },
      links: [],
    },
  };

  beforeAll(async () => {
    server = hapi.server();
    server.views({
      engines: { njk: { compile: () => () => "rendered" } },
      relativeTo: __dirname,
      path: "../views",
    });
    server.route([viewConfirmStageOutcomeRoute, confirmStageOutcomeRoute]);
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    getFlashData.mockReturnValue({ errors: null, formData: {} });
    findCaseByIdUseCase.mockResolvedValue(mockCaseData);
    createConfirmStageOutcomeViewModel.mockReturnValue({
      pageTitle: "Confirm",
      data: { caseId: "case-123" },
    });
  });

  describe("GET /cases/{caseId}/stage/outcome/confirm", () => {
    it("should render confirmation page", async () => {
      const { statusCode } = await server.inject({
        method: "GET",
        url: "/cases/case-123/stage/outcome/confirm?actionCode=REJECT_APPLICATION",
        auth: {
          credentials: {
            token: "mock-token",
            user: { id: "user-1" },
          },
          strategy: "session",
        },
      });

      expect(statusCode).toBe(200);
      expect(findCaseByIdUseCase).toHaveBeenCalledWith(
        { token: "mock-token", user: { id: "user-1" } },
        "case-123",
      );
      expect(createConfirmStageOutcomeViewModel).toHaveBeenCalledWith({
        page: mockCaseData,
        request: expect.any(Object),
        actionCode: "REJECT_APPLICATION",
        formData: {},
        errors: null,
      });
    });

    it("should pass flash data to view model", async () => {
      const flashData = {
        errors: { confirmation: { text: "Select an option" } },
        formData: { confirmation: "yes" },
      };
      getFlashData.mockReturnValue(flashData);

      await server.inject({
        method: "GET",
        url: "/cases/case-123/stage/outcome/confirm?actionCode=REJECT_APPLICATION",
        auth: {
          credentials: { token: "mock-token", user: {} },
          strategy: "session",
        },
      });

      expect(createConfirmStageOutcomeViewModel).toHaveBeenCalledWith({
        page: mockCaseData,
        request: expect.any(Object),
        actionCode: "REJECT_APPLICATION",
        formData: { confirmation: "yes" },
        errors: { confirmation: { text: "Select an option" } },
      });
    });
  });

  describe("POST /cases/{caseId}/stage/outcome/confirm", () => {
    it("should redirect with error when no confirmation selected", async () => {
      const payload = {
        actionCode: "REJECT_APPLICATION",
        comment: "Test comment",
      };

      const { statusCode, headers } = await server.inject({
        method: "POST",
        url: "/cases/case-123/stage/outcome/confirm",
        payload,
        auth: {
          credentials: { token: "mock-token", user: {} },
          strategy: "session",
        },
      });

      expect(statusCode).toBe(302);
      expect(headers.location).toBe(
        "/cases/case-123/stage/outcome/confirm?actionCode=REJECT_APPLICATION",
      );
      expect(setFlashData).toHaveBeenCalledWith(expect.any(Object), {
        errors: {
          confirmation: {
            text: "Select an option",
            href: "#confirmation",
          },
        },
        formData: payload,
      });
    });

    it("should execute action and redirect when 'yes' is selected", async () => {
      updateStageOutcomeUseCase.mockResolvedValue({ success: true });

      const payload = {
        confirmation: "yes",
        actionCode: "REJECT_APPLICATION",
        comment: "Rejected due to ineligibility",
      };

      const { statusCode, headers } = await server.inject({
        method: "POST",
        url: "/cases/case-123/stage/outcome/confirm",
        payload,
        auth: {
          credentials: { token: "mock-token", user: {} },
          strategy: "session",
        },
      });

      expect(statusCode).toBe(302);
      expect(headers.location).toBe("/cases/case-123");
      expect(updateStageOutcomeUseCase).toHaveBeenCalledWith(
        { token: "mock-token", user: {} },
        {
          caseId: "case-123",
          actionData: {
            actionCode: "REJECT_APPLICATION",
            commentFieldName: "REJECT_APPLICATION-comment",
            comment: "Rejected due to ineligibility",
          },
        },
      );
    });

    it("should redirect without executing action when 'no' is selected", async () => {
      const payload = {
        confirmation: "no",
        actionCode: "REJECT_APPLICATION",
        comment: "Test comment",
      };

      const { statusCode, headers } = await server.inject({
        method: "POST",
        url: "/cases/case-123/stage/outcome/confirm",
        payload,
        auth: {
          credentials: { token: "mock-token", user: {} },
          strategy: "session",
        },
      });

      expect(statusCode).toBe(302);
      expect(headers.location).toBe("/cases/case-123");
      expect(updateStageOutcomeUseCase).not.toHaveBeenCalled();
    });

    it("should handle use case errors", async () => {
      const mockErrors = {
        "REJECT_APPLICATION-comment": {
          text: "Comment is required",
          href: "#REJECT_APPLICATION-comment",
        },
      };
      updateStageOutcomeUseCase.mockResolvedValue({
        success: false,
        errors: mockErrors,
      });

      const payload = {
        confirmation: "yes",
        actionCode: "REJECT_APPLICATION",
        comment: "",
      };

      const { statusCode, headers } = await server.inject({
        method: "POST",
        url: "/cases/case-123/stage/outcome/confirm",
        payload,
        auth: {
          credentials: { token: "mock-token", user: {} },
          strategy: "session",
        },
      });

      expect(statusCode).toBe(302);
      expect(headers.location).toBe(
        "/cases/case-123/stage/outcome/confirm?actionCode=REJECT_APPLICATION",
      );
      expect(setFlashData).toHaveBeenCalledWith(expect.any(Object), {
        errors: mockErrors,
        formData: payload,
      });
    });
  });
});

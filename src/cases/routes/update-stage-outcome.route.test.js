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
import { setFlashData } from "../../common/helpers/flash-helpers.js";
import { setPendingStageOutcomeConfirmation } from "../../common/helpers/pending-stage-outcome-confirmation-helpers.js";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import {
  updateStageOutcomeUseCase,
  validateStageOutcomeAction,
} from "../use-cases/update-stage-outcome-use.case.js";
import { updateStageOutcomeRoute } from "./update-stage-outcome.route.js";

vi.mock("../use-cases/update-stage-outcome-use.case.js");
vi.mock("../use-cases/find-case-by-id.use-case.js");
vi.mock("../../common/helpers/flash-helpers.js");
vi.mock("../../common/helpers/pending-stage-outcome-confirmation-helpers.js");

describe("updateStageOutcomeRoute", () => {
  let server;

  const mockCaseDataWithoutConfirm = {
    data: {
      stage: {
        actions: [
          { code: "approve", name: "Approve", confirm: null },
          { code: "reject", name: "Reject", confirm: null },
          {
            code: "conditional-approval",
            name: "Conditional Approval",
            confirm: null,
          },
        ],
      },
    },
  };

  const mockCaseDataWithConfirm = {
    data: {
      stage: {
        actions: [
          { code: "approve", name: "Approve", confirm: null },
          {
            code: "reject",
            name: "Reject",
            confirm: { details: [], yes: null, no: null },
          },
        ],
      },
    },
  };

  beforeAll(async () => {
    server = hapi.server();
    server.route(updateStageOutcomeRoute);
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    findCaseByIdUseCase.mockResolvedValue(mockCaseDataWithoutConfirm);
    validateStageOutcomeAction.mockReturnValue({ success: true });
  });

  describe("POST /cases/{caseId}/stage/outcome", () => {
    it("should successfully update stage outcome and redirect", async () => {
      updateStageOutcomeUseCase.mockResolvedValue({ success: true });

      const payload = {
        actionCode: "approve",
        "approve-comment": "This looks good to me",
      };

      const { statusCode, headers } = await server.inject({
        method: "POST",
        url: "/cases/test-case-id/stage/outcome",
        payload,
        auth: {
          credentials: {
            token: "mock-token",
            user: {},
          },
          strategy: "session",
        },
      });

      expect(statusCode).toBe(302);
      expect(headers.location).toBe("/cases/test-case-id");

      const authContext = {
        token: "mock-token",
        user: {},
      };

      expect(updateStageOutcomeUseCase).toHaveBeenCalledWith(authContext, {
        caseId: "test-case-id",
        actionData: {
          actionCode: "approve",
          commentFieldName: "approve-comment",
          comment: "This looks good to me",
        },
      });
    });

    it("should redirect to confirmation page when action has confirm property", async () => {
      findCaseByIdUseCase.mockResolvedValue(mockCaseDataWithConfirm);
      updateStageOutcomeUseCase.mockResolvedValue({ success: true });

      const payload = {
        actionCode: "reject",
        "reject-comment": "Rejection reason",
      };

      const { statusCode, headers } = await server.inject({
        method: "POST",
        url: "/cases/case-123/stage/outcome",
        payload,
        auth: {
          credentials: { token: "mock-token", user: {} },
          strategy: "session",
        },
      });

      expect(statusCode).toBe(302);
      expect(headers.location).toBe(
        "/cases/case-123/stage/outcome/confirm?actionCode=reject",
      );
      expect(setPendingStageOutcomeConfirmation).toHaveBeenCalledWith(
        expect.any(Object),
        {
          caseId: "case-123",
          actionCode: "reject",
          comment: "Rejection reason",
        },
      );
      expect(setFlashData).toHaveBeenCalledWith(expect.any(Object), {
        formData: payload,
      });
      expect(validateStageOutcomeAction).toHaveBeenCalledWith(
        mockCaseDataWithConfirm.data,
        {
          actionCode: "reject",
          commentFieldName: "reject-comment",
          comment: "Rejection reason",
        },
      );
      expect(updateStageOutcomeUseCase).not.toHaveBeenCalled();
    });

    it("should redirect back to case page when confirm action validation fails", async () => {
      findCaseByIdUseCase.mockResolvedValue(mockCaseDataWithConfirm);
      validateStageOutcomeAction.mockReturnValue({
        success: false,
        errors: {
          "reject-comment": {
            text: "Rejection reason is required",
            href: "#reject-comment",
          },
        },
      });

      const payload = {
        actionCode: "reject",
        "reject-comment": "",
      };

      const { statusCode, headers } = await server.inject({
        method: "POST",
        url: "/cases/case-123/stage/outcome",
        payload,
        auth: {
          credentials: { token: "mock-token", user: {} },
          strategy: "session",
        },
      });

      expect(statusCode).toBe(302);
      expect(headers.location).toBe("/cases/case-123");
      expect(setFlashData).toHaveBeenCalledWith(expect.any(Object), {
        errors: {
          "reject-comment": {
            text: "Rejection reason is required",
            href: "#reject-comment",
          },
        },
        formData: payload,
      });
    });

    it("should handle validation errors and redirect with flash data", async () => {
      const mockErrors = {
        "reject-comment": {
          text: "Rejection reason is required",
          href: "#reject-comment",
        },
      };

      updateStageOutcomeUseCase.mockResolvedValue({
        success: false,
        errors: mockErrors,
      });

      const payload = {
        actionCode: "reject",
        "reject-comment": "",
      };

      const { statusCode, headers } = await server.inject({
        method: "POST",
        url: "/cases/case-123/stage/outcome",
        payload,
        auth: {
          credentials: {
            token: "mock-token",
            user: {},
          },
          strategy: "session",
        },
      });

      expect(statusCode).toBe(302);
      expect(headers.location).toBe("/cases/case-123");

      const authContext = {
        token: "mock-token",
        user: {},
      };

      expect(updateStageOutcomeUseCase).toHaveBeenCalledWith(authContext, {
        caseId: "case-123",
        actionData: {
          actionCode: "reject",
          commentFieldName: "reject-comment",
          comment: "",
        },
      });

      // Verify flash data was set
      expect(setFlashData).toHaveBeenCalledWith(expect.any(Object), {
        errors: mockErrors,
        formData: payload,
      });
    });

    it("should extract action data correctly for different action types", async () => {
      updateStageOutcomeUseCase.mockResolvedValue({ success: true });

      const payload = {
        actionCode: "conditional-approval",
        "conditional-approval-comment": "Approval with conditions",
        otherField: "should be ignored",
      };

      await server.inject({
        method: "POST",
        url: "/cases/test-case-id/stage/outcome",
        payload,
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

      expect(updateStageOutcomeUseCase).toHaveBeenCalledWith(authContext, {
        caseId: "test-case-id",
        actionData: {
          actionCode: "conditional-approval",
          commentFieldName: "conditional-approval-comment",
          comment: "Approval with conditions",
        },
      });
    });

    it("should handle missing comment field", async () => {
      updateStageOutcomeUseCase.mockResolvedValue({ success: true });

      const payload = {
        actionCode: "approve",
      };
      const authContext = { token: "mock-token", user: undefined };

      await server.inject({
        method: "POST",
        url: "/cases/test-case-id/stage/outcome",
        payload,
        auth: {
          credentials: authContext,
          strategy: "session",
        },
      });

      expect(updateStageOutcomeUseCase).toHaveBeenCalledWith(authContext, {
        caseId: "test-case-id",
        actionData: {
          actionCode: "approve",
          commentFieldName: "approve-comment",
          comment: undefined,
        },
      });
    });

    it("should handle empty payload", async () => {
      updateStageOutcomeUseCase.mockResolvedValue({ success: true });

      const payload = {};
      const authContext = { token: "mock-token", user: undefined };

      await server.inject({
        method: "POST",
        url: "/cases/test-case-id/stage/outcome",
        payload,
        auth: {
          credentials: authContext,
          strategy: "session",
        },
      });

      expect(updateStageOutcomeUseCase).toHaveBeenCalledWith(authContext, {
        caseId: "test-case-id",
        actionData: {
          actionCode: undefined,
          commentFieldName: "undefined-comment",
          comment: undefined,
        },
      });
    });
  });
});

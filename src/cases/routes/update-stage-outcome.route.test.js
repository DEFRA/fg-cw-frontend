import hapi from "@hapi/hapi";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { setFlashData } from "../../common/helpers/flash-helpers.js";
import { updateStageOutcomeUseCase } from "../use-cases/update-stage-outcome-use.case.js";
import { updateStageOutcomeRoute } from "./update-stage-outcome.route.js";

vi.mock("../use-cases/update-stage-outcome-use.case.js");
vi.mock("../../common/helpers/flash-helpers.js");

describe("updateStageOutcomeRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(updateStageOutcomeRoute);
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
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

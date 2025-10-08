import Boom from "@hapi/boom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateStageOutcome } from "../repositories/case.repository.js";
import { findCaseByIdUseCase } from "./find-case-by-id.use-case.js";
import { updateStageOutcomeUseCase } from "./update-stage-outcome-use.case.js";

vi.mock("../repositories/case.repository.js");
vi.mock("./find-case-by-id.use-case.js");

describe("updateStageOutcomeUseCase", () => {
  const authContext = {
    profile: {
      oid: "12345678-1234-1234-1234-123456789012",
      email: "bob.bill@defra.gov.uk",
      name: "Bob Bill",
      roles: ["FCP.Casework.Read"],
    },
  };
  const mockCaseData = {
    _id: "case-123",
    currentStage: "application-review",
    stages: [
      {
        id: "application-review",
        actions: [
          {
            id: "approve",
            label: "Approve",
            comment: {
              label: "Approval reason",
              type: "REQUIRED",
            },
          },
          {
            id: "reject",
            label: "Reject",
            comment: {
              label: "Rejection reason",
              type: "REQUIRED",
            },
          },
          {
            id: "on-hold",
            label: "Put on hold",
            comment: {
              label: "Hold reason",
              type: "OPTIONAL",
            },
          },
          {
            id: "no-comment",
            label: "No comment action",
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    findCaseByIdUseCase.mockResolvedValue(mockCaseData);
  });

  describe("successful stage outcome update", () => {
    it("updates stage outcome with valid required comment", async () => {
      const actionData = {
        actionId: "approve",
        commentFieldName: "approve-comment",
        comment: "This application looks good",
      };

      const result = await updateStageOutcomeUseCase(authContext, {
        caseId: "case-123",
        actionData,
      });

      expect(findCaseByIdUseCase).toHaveBeenCalledWith(authContext, "case-123");
      expect(updateStageOutcome).toHaveBeenCalledWith(authContext, {
        caseId: "case-123",
        actionId: "approve",
        comment: "This application looks good",
      });
      expect(result).toEqual({ success: true });
    });

    it("updates stage outcome with optional comment", async () => {
      const actionData = {
        actionId: "on-hold",
        commentFieldName: "on-hold-comment",
        comment: "Waiting for additional documents",
      };

      const result = await updateStageOutcomeUseCase(authContext, {
        caseId: "case-456",
        actionData,
      });

      expect(updateStageOutcome).toHaveBeenCalledWith(authContext, {
        caseId: "case-456",
        actionId: "on-hold",
        comment: "Waiting for additional documents",
      });
      expect(result).toEqual({ success: true });
    });

    it("updates stage outcome without comment when not required", async () => {
      const actionData = {
        actionId: "on-hold",
        commentFieldName: "on-hold-comment",
        comment: "",
      };

      const result = await updateStageOutcomeUseCase(authContext, {
        caseId: "case-789",
        actionData,
      });

      expect(updateStageOutcome).toHaveBeenCalledWith(authContext, {
        caseId: "case-789",
        actionId: "on-hold",
        comment: "",
      });
      expect(result).toEqual({ success: true });
    });

    it("updates stage outcome for action without comment field", async () => {
      const actionData = {
        actionId: "no-comment",
        commentFieldName: "no-comment-comment",
        comment: undefined,
      };

      const result = await updateStageOutcomeUseCase(authContext, {
        caseId: "case-no-comment",
        actionData,
      });

      expect(updateStageOutcome).toHaveBeenCalledWith(authContext, {
        caseId: "case-no-comment",
        actionId: "no-comment",
        comment: undefined,
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe("validation errors", () => {
    it("returns error when required comment is missing", async () => {
      const actionData = {
        actionId: "approve",
        commentFieldName: "approve-comment",
        comment: "",
      };

      const result = await updateStageOutcomeUseCase(authContext, {
        caseId: "case-123",
        actionData,
      });

      expect(findCaseByIdUseCase).toHaveBeenCalledWith(authContext, "case-123");
      expect(updateStageOutcome).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        errors: {
          "approve-comment": {
            text: "Approval reason is required",
            href: "#approve-comment",
          },
        },
      });
    });

    it("returns error when required comment is only whitespace", async () => {
      const actionData = {
        actionId: "reject",
        commentFieldName: "reject-comment",
        comment: "   \t\n  ",
      };

      const result = await updateStageOutcomeUseCase(authContext, {
        caseId: "case-whitespace",
        actionData,
      });

      expect(updateStageOutcome).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        errors: {
          "reject-comment": {
            text: "Rejection reason is required",
            href: "#reject-comment",
          },
        },
      });
    });

    it("returns error when required comment is null", async () => {
      const actionData = {
        actionId: "approve",
        commentFieldName: "approve-comment",
        comment: null,
      };

      const result = await updateStageOutcomeUseCase(authContext, {
        caseId: "case-null",
        actionData,
      });

      expect(result).toEqual({
        success: false,
        errors: {
          "approve-comment": {
            text: "Approval reason is required",
            href: "#approve-comment",
          },
        },
      });
    });

    it("returns error when required comment is undefined", async () => {
      const actionData = {
        actionId: "reject",
        commentFieldName: "reject-comment",
        comment: undefined,
      };

      const result = await updateStageOutcomeUseCase(authContext, {
        caseId: "case-undefined",
        actionData,
      });

      expect(result).toEqual({
        success: false,
        errors: {
          "reject-comment": {
            text: "Rejection reason is required",
            href: "#reject-comment",
          },
        },
      });
    });
  });

  describe("error handling", () => {
    it("throws Boom error when action is not found", async () => {
      const actionData = {
        actionId: "non-existent-action",
        commentFieldName: "non-existent-comment",
        comment: "Some comment",
      };

      await expect(
        updateStageOutcomeUseCase(authContext, {
          caseId: "case-123",
          actionData,
        }),
      ).rejects.toThrow(
        Boom.badRequest("Invalid action selected: non-existent-action"),
      );

      expect(findCaseByIdUseCase).toHaveBeenCalledWith(authContext, "case-123");
      expect(updateStageOutcome).not.toHaveBeenCalled();
    });

    it("throws Boom error when stage is not found", async () => {
      const mockCaseWithInvalidStage = {
        ...mockCaseData,
        currentStage: "non-existent-stage",
      };
      findCaseByIdUseCase.mockResolvedValue(mockCaseWithInvalidStage);

      const actionData = {
        actionId: "approve",
        commentFieldName: "approve-comment",
        comment: "Some comment",
      };

      await expect(
        updateStageOutcomeUseCase(authContext, {
          caseId: "case-invalid-stage",
          actionData,
        }),
      ).rejects.toThrow(Boom.badRequest("Invalid action selected: approve"));
    });

    it("propagates repository errors", async () => {
      const actionData = {
        actionId: "approve",
        commentFieldName: "approve-comment",
        comment: "Valid comment",
      };

      const repositoryError = new Error("Database connection failed");
      updateStageOutcome.mockRejectedValue(repositoryError);

      await expect(
        updateStageOutcomeUseCase(authContext, {
          caseId: "case-repo-error",
          actionData,
        }),
      ).rejects.toThrow("Database connection failed");

      expect(updateStageOutcome).toHaveBeenCalledWith(authContext, {
        caseId: "case-repo-error",
        actionId: "approve",
        comment: "Valid comment",
      });
    });

    it("propagates findCaseByIdUseCase errors", async () => {
      const findCaseError = new Error("Case not found");
      findCaseByIdUseCase.mockRejectedValue(findCaseError);

      const actionData = {
        actionId: "approve",
        commentFieldName: "approve-comment",
        comment: "Valid comment",
      };

      await expect(
        updateStageOutcomeUseCase(authContext, {
          caseId: "non-existent-case",
          actionData,
        }),
      ).rejects.toThrow("Case not found");

      expect(findCaseByIdUseCase).toHaveBeenCalledWith(
        authContext,
        "non-existent-case",
      );
      expect(updateStageOutcome).not.toHaveBeenCalled();
    });
  });
});

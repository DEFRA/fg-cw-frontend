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
  clearPendingStageOutcomeConfirmation,
  getPendingStageOutcomeConfirmation,
} from "../../common/helpers/pending-stage-outcome-confirmation-helpers.js";
import {
  getFlashData,
  setFlashData,
  setFlashNotification,
} from "../../common/helpers/flash-helpers.js";
import { nunjucks } from "../../common/nunjucks/nunjucks.js";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { updateStageOutcomeUseCase } from "../use-cases/update-stage-outcome-use.case.js";
import { createConfirmStageOutcomeViewModel } from "../view-models/confirm-stage-outcome.view-model.js";
import {
  confirmStageOutcomeRoute,
  viewConfirmStageOutcomeRoute,
} from "./confirm-stage-outcome.route.js";

vi.mock("../../common/helpers/flash-helpers.js");
vi.mock("../../common/helpers/pending-stage-outcome-confirmation-helpers.js");
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
    server.route([viewConfirmStageOutcomeRoute, confirmStageOutcomeRoute]);
    await server.register([nunjucks]);
    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    getFlashData.mockReturnValue({ errors: null, formData: {} });
    getPendingStageOutcomeConfirmation.mockReturnValue({
      caseId: "case-123",
      actionCode: "REJECT_APPLICATION",
      comment: "Stored comment",
    });
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
        formData: { comment: "Stored comment" },
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
        formData: { confirmation: "yes", comment: "Stored comment" },
        errors: { confirmation: { text: "Select an option" } },
      });
    });

    it("should redirect to the case when pending confirmation state is missing", async () => {
      getPendingStageOutcomeConfirmation.mockReturnValue(undefined);

      const { statusCode, headers } = await server.inject({
        method: "GET",
        url: "/cases/case-123/stage/outcome/confirm?actionCode=REJECT_APPLICATION",
        auth: {
          credentials: { token: "mock-token", user: {} },
          strategy: "session",
        },
      });

      expect(statusCode).toBe(302);
      expect(headers.location).toBe("/cases/case-123");
      expect(setFlashNotification).toHaveBeenCalledWith(expect.any(Object), {
        type: "warning",
        title: "Confirmation page expired",
        text: "Enter the decision details again before confirming this action.",
      });
      expect(createConfirmStageOutcomeViewModel).not.toHaveBeenCalled();
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
        formData: {
          ...payload,
          comment: "Stored comment",
        },
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
            comment: "Stored comment",
          },
        },
      );
      expect(clearPendingStageOutcomeConfirmation).toHaveBeenCalledWith(
        expect.any(Object),
        {
          caseId: "case-123",
          actionCode: "REJECT_APPLICATION",
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
      expect(clearPendingStageOutcomeConfirmation).toHaveBeenCalledWith(
        expect.any(Object),
        {
          caseId: "case-123",
          actionCode: "REJECT_APPLICATION",
        },
      );
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
        formData: {
          ...payload,
          comment: "Stored comment",
        },
      });
    });

    it("should redirect to the case when pending confirmation state is missing", async () => {
      getPendingStageOutcomeConfirmation.mockReturnValue(undefined);

      const { statusCode, headers } = await server.inject({
        method: "POST",
        url: "/cases/case-123/stage/outcome/confirm",
        payload: {
          confirmation: "yes",
          actionCode: "REJECT_APPLICATION",
        },
        auth: {
          credentials: { token: "mock-token", user: {} },
          strategy: "session",
        },
      });

      expect(statusCode).toBe(302);
      expect(headers.location).toBe("/cases/case-123");
      expect(setFlashNotification).toHaveBeenCalledWith(expect.any(Object), {
        type: "warning",
        title: "Confirmation page expired",
        text: "Enter the decision details again before confirming this action.",
      });
      expect(updateStageOutcomeUseCase).not.toHaveBeenCalled();
    });
  });
});

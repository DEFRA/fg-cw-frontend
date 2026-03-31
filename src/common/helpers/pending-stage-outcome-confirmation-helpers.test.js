import { describe, expect, it, vi } from "vitest";
import {
  clearPendingStageOutcomeConfirmation,
  getPendingStageOutcomeConfirmation,
  setPendingStageOutcomeConfirmation,
} from "./pending-stage-outcome-confirmation-helpers.js";

describe("pending stage outcome confirmation helpers", () => {
  const createRequest = (initialStore = {}) => {
    let store = initialStore;

    return {
      yar: {
        get: vi.fn(() => store),
        set: vi.fn((_key, value) => {
          store = value;
        }),
      },
    };
  };

  it("stores pending confirmation by case and action", () => {
    const request = createRequest();

    setPendingStageOutcomeConfirmation(request, {
      caseId: "case-1",
      actionCode: "RETURN_TO_CUSTOMER",
      comment: "Missing evidence",
    });

    expect(request.yar.set).toHaveBeenCalledWith(
      "pendingStageOutcomeConfirmation",
      {
        "case-1:RETURN_TO_CUSTOMER": {
          caseId: "case-1",
          actionCode: "RETURN_TO_CUSTOMER",
          comment: "Missing evidence",
        },
      },
    );
  });

  it("preserves other pending confirmations", () => {
    const request = createRequest({
      "case-1:REJECT": {
        caseId: "case-1",
        actionCode: "REJECT",
        comment: "Other comment",
      },
    });

    setPendingStageOutcomeConfirmation(request, {
      caseId: "case-2",
      actionCode: "RETURN_TO_CUSTOMER",
      comment: "Missing evidence",
    });

    expect(request.yar.set).toHaveBeenCalledWith(
      "pendingStageOutcomeConfirmation",
      {
        "case-1:REJECT": {
          caseId: "case-1",
          actionCode: "REJECT",
          comment: "Other comment",
        },
        "case-2:RETURN_TO_CUSTOMER": {
          caseId: "case-2",
          actionCode: "RETURN_TO_CUSTOMER",
          comment: "Missing evidence",
        },
      },
    );
  });

  it("retrieves pending confirmation by case and action", () => {
    const request = createRequest({
      "case-1:RETURN_TO_CUSTOMER": {
        caseId: "case-1",
        actionCode: "RETURN_TO_CUSTOMER",
        comment: "Missing evidence",
      },
    });

    expect(
      getPendingStageOutcomeConfirmation(request, {
        caseId: "case-1",
        actionCode: "RETURN_TO_CUSTOMER",
      }),
    ).toEqual({
      caseId: "case-1",
      actionCode: "RETURN_TO_CUSTOMER",
      comment: "Missing evidence",
    });
  });

  it("clears only the matching pending confirmation", () => {
    const request = createRequest({
      "case-1:RETURN_TO_CUSTOMER": {
        caseId: "case-1",
        actionCode: "RETURN_TO_CUSTOMER",
        comment: "Missing evidence",
      },
      "case-2:REJECT": {
        caseId: "case-2",
        actionCode: "REJECT",
        comment: "Other comment",
      },
    });

    clearPendingStageOutcomeConfirmation(request, {
      caseId: "case-1",
      actionCode: "RETURN_TO_CUSTOMER",
    });

    expect(request.yar.set).toHaveBeenCalledWith(
      "pendingStageOutcomeConfirmation",
      {
        "case-2:REJECT": {
          caseId: "case-2",
          actionCode: "REJECT",
          comment: "Other comment",
        },
      },
    );
  });

  it("handles missing yar gracefully", () => {
    const request = {};

    expect(
      getPendingStageOutcomeConfirmation(request, {
        caseId: "case-1",
        actionCode: "RETURN_TO_CUSTOMER",
      }),
    ).toBeUndefined();

    expect(() =>
      setPendingStageOutcomeConfirmation(request, {
        caseId: "case-1",
        actionCode: "RETURN_TO_CUSTOMER",
        comment: "Missing evidence",
      }),
    ).not.toThrow();

    expect(() =>
      clearPendingStageOutcomeConfirmation(request, {
        caseId: "case-1",
        actionCode: "RETURN_TO_CUSTOMER",
      }),
    ).not.toThrow();
  });
});

import { describe, expect, it } from "vitest";
import { createTimelineViewModel } from "./timeline.view-model.js";

describe("Timeline view model", () => {
  it("should return a correct data model", () => {
    const caseItem = {
      caseRef: "ABC-123",
      workflowCode: "wf-123",
      _id: "0999091983",
      status: "great",
      dateReceived: {
        $date: "2025-06-16T09:01:14.072Z",
      },
      assignedUser: "Dumbledore",
      timeline: [],
      payload: {
        identifiers: {
          sbi: "HHG-1",
        },
        answers: {
          scheme: "JKI-009",
          agreementName: "Donald's Agreement",
        },
        submittedAt: "2025-03-28T11:30:52.000Z",
      },
      pages: {
        details: {
          tabs: {},
          banner: {
            title: "Timeline",
          },
        },
      },
    };

    // Expected view model output for the given caseItem
    const expected = {
      pageTitle: "Timeline ABC-123",
      pageHeading: "Timeline",
      breadcrumbs: [],
      data: {
        case: {
          _id: "0999091983",
          clientRef: "ABC-123",
          businessName: "Donald's Agreement",
          code: "wf-123",
          sbi: "HHG-1",
          scheme: "JKI-009",
          dateReceived: { $date: "2025-06-16T09:01:14.072Z" },
          submittedAt: "28/03/2025",
          status: "great",
          assignedUser: "Dumbledore",
          payload: {
            identifiers: {
              sbi: "HHG-1",
            },
            answers: {
              scheme: "JKI-009",
              agreementName: "Donald's Agreement",
            },
            submittedAt: "2025-03-28T11:30:52.000Z",
          },
          timeline: [],
          banner: {
            title: "Timeline",
          },
        },
      },
    };

    expect(createTimelineViewModel(caseItem)).toEqual(expected);
  });
});

import { describe, expect, it, vi } from "vitest";
import { createMockLinks } from "../../../test/data/case-test-data.js";
import { createTimelineViewModel } from "./timeline.view-model.js";

vi.mock("../../common/view-models/header.view-model.js");

const mockRequest = { path: "/cases/0999091983/timeline" };

const createMockPage = (caseData) => ({
  data: caseData,
  header: { navItems: [] },
});

describe("Timeline view model", () => {
  it("should return a correct data model", () => {
    const caseItem = {
      caseRef: "ABC-123",
      workflowCode: "wf-123",
      _id: "0999091983",
      currentStatus: "great",
      dateReceived: {
        $date: "2025-06-16T09:01:14.072Z",
      },
      assignedUser: "Dumbledore",
      timeline: [],
      banner: {},
      links: createMockLinks("0999091983"),
      payload: {
        identifiers: {
          sbi: "HHG-1",
          submittedAt: "2025-03-28T11:30:52.000Z",
        },
        answers: {
          scheme: "JKI-009",
          agreementName: "Donald's Agreement",
        },
      },
    };

    // Expected view model output for the given caseItem
    const expected = {
      pageTitle: "Timeline ABC-123",
      pageHeading: "Timeline",
      breadcrumbs: [],
      links: [
        {
          id: "tasks",
          text: "Tasks",
          href: "/cases/0999091983",
          active: false,
        },
        {
          id: "case-details",
          text: "Case Details",
          href: "/cases/0999091983/case-details",
          active: false,
        },
        {
          id: "notes",
          text: "Notes",
          href: "/cases/0999091983/notes",
          active: false,
        },
        {
          id: "timeline",
          text: "Timeline",
          href: "/cases/0999091983/timeline",
          active: true,
        },
      ],
      data: {
        case: {
          _id: "0999091983",
          clientRef: "ABC-123",
          businessName: "Donald's Agreement",
          code: "wf-123",
          sbi: "HHG-1",
          scheme: "JKI-009",
          dateReceived: { $date: "2025-06-16T09:01:14.072Z" },
          submittedAt: "Invalid Date",
          currentStatus: "great",
          assignedUser: "Dumbledore",
          payload: {
            identifiers: {
              sbi: "HHG-1",
              submittedAt: "2025-03-28T11:30:52.000Z",
            },
            answers: {
              scheme: "JKI-009",
              agreementName: "Donald's Agreement",
            },
          },
          timeline: [],
          banner: {},
        },
      },
    };

    const result = createTimelineViewModel({
      page: createMockPage(caseItem),
      request: mockRequest,
    });

    expect(result).toMatchObject({
      pageTitle: expected.pageTitle,
      pageHeading: expected.pageHeading,
      breadcrumbs: expected.breadcrumbs,
      links: expected.links,
      data: expected.data,
    });
  });
});

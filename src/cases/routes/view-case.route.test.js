import hapi from "@hapi/hapi";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { nunjucks } from "../../common/nunjucks/nunjucks.js";
import { findCaseByIdUseCase } from "../use-cases/find-case-by-id.use-case.js";
import { viewCaseRoute } from "./view-case.route.js";

vi.mock("../use-cases/find-case-by-id.use-case.js");

describe("viewCaseRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(viewCaseRoute);
    await server.register([nunjucks]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("returns a list of cases", async () => {
    findCaseByIdUseCase.mockResolvedValue({
      _id: "686baafc9ac48f446c317655",
      caseRef: "PMF-REF-1",
      workflowCode: "pigs-might-fly",
      status: "NEW",
      dateReceived: "2025-03-27T11:34:52Z",
      currentStage: "application-received",
      assignedUser: null,
      payload: {
        clientRef: "PMF-REF-1",
        code: "pigs-might-fly",
        createdAt: "2025-03-27T10:34:52.000Z",
        submittedAt: "2025-03-28T11:30:52.000Z",
        answers: {
          isPigFarmer: true,
          totalPigs: 10,
          whitePigsCount: 2,
          britishLandracePigsCount: 2,
          berkshirePigsCount: 3,
          otherPigsCount: 3,
        },
      },
      stages: [
        {
          id: "application-received",
          taskGroups: [
            {
              id: "review-automated-checks",
              tasks: [
                {
                  id: "review-application-data",
                  status: "pending",
                  title: "Review application data",
                  type: "boolean",
                },
              ],
              title: "Review Automated Checks",
            },
          ],
          title: "Application Received",
          actions: [
            {
              id: "accept",
              label: "Accept",
            },
            {
              id: "reject",
              label: "Reject",
            },
          ],
        },
        {
          id: "assessment",
          taskGroups: [
            {
              id: "check-application",
              tasks: [
                {
                  id: "check-application-and-documents",
                  status: "pending",
                  title: "Check application and documents",
                  type: "boolean",
                },
                {
                  id: "check-find-farm-and-land-payment-data",
                  status: "pending",
                  title: "Check on Find farm and land payment data",
                  type: "boolean",
                },
                {
                  id: "check-rps-dual-funding",
                  status: "pending",
                  title: "Check on RPS (Dual Funding)",
                  type: "boolean",
                },
              ],
              title: "Check Application",
            },
            {
              id: "registration-checks",
              tasks: [
                {
                  id: "confirm-farm-has-cph",
                  status: "pending",
                  title: "Confirm farm has a CPH",
                  type: "boolean",
                },
                {
                  id: "confirm-apha-registration",
                  status: "pending",
                  title: "Confirm APHA registration",
                  type: "boolean",
                },
              ],
              title: "Registration checks",
            },
          ],
          title: "Assessment",
          actions: [
            {
              id: "confirm-approval",
              label: "Confirm Approval",
            },
            {
              id: "confirm-rejection",
              label: "Confirm Rejection",
            },
          ],
        },
        {
          id: "contracted",
          taskGroups: [],
          title: "Contracted",
          actions: [],
        },
      ],
      timeline: [],
      requiredRoles: {
        allOf: ["ROLE_RPA_ADMIN"],
        anyOf: ["ROLE_RPA_ADMIN"],
      },
      pages: {
        details: {
          banner: {
            title: {
              ref: "$.payload.businessName",
              type: "string",
            },
            summary: {
              reference: {
                label: "Reference",
                ref: "$.caseRef",
                type: "string",
              },
              status: {
                label: "Status",
                ref: "$.status",
                type: "string",
              },
              dateReceived: {
                label: "Date Received",
                ref: "$.dateReceived",
                type: "date",
              },
            },
          },
          tabs: {
            caseDetails: {
              title: "Application",
              sections: [
                {
                  title: "Applicant Details",
                  type: "object",
                  component: "list",
                  fields: [
                    {
                      ref: "$.payload.answers.isPigFarmer",
                      type: "boolean",
                      label: "Are you a pig farmer?",
                    },
                  ],
                },
                {
                  title: "Pig Stock Details",
                  type: "object",
                  component: "list",
                  fields: [
                    {
                      ref: "$.payload.answers.totalPigs",
                      type: "number",
                      label: "Total Pigs",
                    },
                    {
                      ref: "$.payload.answers.whitePigsCount",
                      type: "number",
                      label: "How many White pigs do you have?",
                    },
                    {
                      ref: "$.payload.answers.britishLandracePigsCount",
                      type: "number",
                      label: "How many British Landrace pigs do you have?",
                    },
                    {
                      ref: "$.payload.answers.berkshirePigsCount",
                      type: "number",
                      label: "How many Berkshire pigs do you have?",
                    },
                    {
                      ref: "$.payload.answers.otherPigsCount",
                      type: "number",
                      label: "How many Other pigs do you have?",
                    },
                  ],
                },
              ],
            },
          },
        },
      },
    });

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/cases/68495db5afe2d27b09b2ee47/case-details",
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });
});

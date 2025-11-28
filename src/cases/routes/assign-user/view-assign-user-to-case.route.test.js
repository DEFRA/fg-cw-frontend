import hapi from "@hapi/hapi";
import Yar from "@hapi/yar";
import { load } from "cheerio";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { findAllUsersUseCase } from "../../../auth/use-cases/find-all-users.use-case.js";
import { nunjucks } from "../../../common/nunjucks/nunjucks.js";
import { flashContext } from "../../../server/plugins/flash-context.js";
import { findAllCasesUseCase } from "../../use-cases/find-all-cases.use-case.js";
import { findCaseByIdUseCase } from "../../use-cases/find-case-by-id.use-case.js";
import { listCasesRoute } from "../list-cases.route.js";
import { viewAssignUserToCaseRoute } from "./view-assign-user-to-case.route.js";

vi.mock("../../use-cases/find-case-by-id.use-case.js");
vi.mock("../../../auth/use-cases/find-all-users.use-case.js");
vi.mock("../../use-cases/find-all-cases.use-case.js");

describe("viewAssignUserToCaseRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(viewAssignUserToCaseRoute);
    server.route(listCasesRoute);
    await server.register([
      nunjucks,
      {
        plugin: Yar,
        options: {
          name: "session",
          cookieOptions: {
            password: "abcdefghijklmnopqrstuvwxyz012345",
            isSecure: false,
            isSameSite: "Strict",
          },
        },
      },
      flashContext,
    ]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("returns a case and list of valid users", async () => {
    findCaseByIdUseCase.mockResolvedValue(mockCase);
    findAllUsersUseCase.mockResolvedValue(mockUsers);

    const { statusCode, result } = await server.inject({
      method: "GET",
      url: "/cases/assign-user?caseId=6870ee690cdf25de1301a300",
      auth: {
        credentials: { token: "mock-token" },
        strategy: "session",
      },
    });

    expect(statusCode).toEqual(200);

    const $ = load(result);
    const view = $("#main-content").html();

    expect(view).toMatchSnapshot();
  });

  it("redirects back to cases list if no caseId supplied", async () => {
    findAllCasesUseCase.mockResolvedValue([]);

    // First request - triggers redirect and sets flash
    const { statusCode, headers } = await server.inject({
      method: "GET",
      url: "/cases/assign-user",
      auth: {
        credentials: { token: "mock-token" },
        strategy: "session",
      },
    });
    expect(statusCode).toEqual(302);
    expect(headers.location).toEqual("/cases");

    // Extract session cookie from redirect response
    const cookie = headers["set-cookie"][0].split(";")[0];

    // Second request - include the session cookie to see the flash message
    const { result } = await server.inject({
      method: "GET",
      url: "/cases",
      headers: {
        cookie, // Pass the session cookie back to the server
      },
      auth: {
        credentials: { token: "mock-token" },
        strategy: "session",
      },
    });
    const $ = load(result);
    const view = $("#main-content").html();
    expect(view).toMatchSnapshot();
  });
});

const mockCase = {
  _id: "case-123",
  payload: {
    clientRef: "CLIENT-001",
    code: "CODE-001",
  },
  requiredRoles: {
    allOf: ["admin", "manager"],
    anyOf: ["reviewer", "approver"],
  },
  assignedUser: { id: "user-1" },
};

const mockUsers = [
  {
    id: "user-1",
    name: "John Doe",
    appRoles: ["admin", "manager", "reviewer"],
  },
  {
    id: "user-2",
    name: "Jane Smith",
    appRoles: ["admin", "manager", "approver"],
  },
];

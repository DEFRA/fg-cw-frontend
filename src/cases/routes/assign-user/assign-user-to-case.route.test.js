import hapi from "@hapi/hapi";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { nunjucks } from "../../../common/nunjucks/nunjucks.js";
import { assignUserToCaseUseCase } from "../../use-cases/assign-user-to-case.use-case.js";
import { assignUserToCaseRoute } from "./assign-user-to-case.route.js";

vi.mock("../../use-cases/assign-user-to-case.use-case.js");

describe("assignUserToCaseRoute", () => {
  let server;

  beforeAll(async () => {
    server = hapi.server();
    server.route(assignUserToCaseRoute);
    await server.register([nunjucks]);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("assigns user to case and redirects to case list with assignedCaseId parameter", async () => {
    const { statusCode, headers } = await server.inject({
      method: "POST",
      url: "/cases/assign-user",
      payload: {
        caseId: "case-id-1",
        assignedUserId: "user-id-1",
      },
    });

    expect(assignUserToCaseUseCase).toHaveBeenCalledWith({
      caseId: "case-id-1",
      assignedUserId: "user-id-1",
    });

    expect(statusCode).toEqual(302);
    expect(headers.location).toEqual(
      "/cases?assignedCaseId=case-id-1#all-cases",
    );
  });
});

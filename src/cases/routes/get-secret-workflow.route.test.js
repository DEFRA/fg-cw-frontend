import Bell from "@hapi/bell";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createServer } from "../../server/index.js";
import { findSecretWorkflowUseCase } from "../use-cases/find-secret-workflow.use-case.js";
import { getSecretWorkflowRoute } from "./get-secret-workflow.route.js";

vi.mock("../use-cases/find-secret-workflow.use-case.js");

describe("getSecretWorkflow", () => {
  let server;

  beforeAll(async () => {
    Bell.simulate(() => ({}));
    server = await createServer();
    server.route(getSecretWorkflowRoute);

    await server.initialize();
  });

  afterAll(async () => {
    await server.stop();
    Bell.simulate(false);
  });

  it("returns 200", async () => {
    const workflowCode = "TEST_WORKFLOW";
    const credentials = {
      token: "access-token",
      refreshToken: "refresh-token",
      expiresAt: new Date("2050-01-01T00:00:00Z").getTime(),
      user: {
        id: "43e8508b6cbd4ac1b29ee73792ab0f4b",
        name: "Joe Bloggs",
        email: "joe@bloggs.com",
        idpRoles: ["FCP.Casework.Read"],
        appRoles: ["ROLE_SING_AND_DANCE"],
      },
    };

    const { statusCode } = await server.inject({
      method: "GET",
      url: `/secret/workflow/${workflowCode}`,
      auth: {
        isAuthenticated: true,
        isAuthorized: false,
        isInjected: true,
        credentials,
        strategy: "session",
        mode: "required",
        error: null,
      },
    });

    expect(statusCode).toEqual(200);

    expect(findSecretWorkflowUseCase).toHaveBeenCalledWith(
      {
        token: credentials.token,
        user: credentials.user,
      },
      workflowCode,
    );
  });
});

import { describe, expect, it, vi } from "vitest";
import { findAll } from "../repositories/case.repository.js";
import { findMyCasesUseCase } from "./find-my-cases.use-case.js";

vi.mock("../repositories/case.repository.js");

describe("findMyCasesUseCase", () => {
  const assignedUserId = "60c72b2f9b1e8d001c8e4f5a";
  const authContext = {
    token: "mock-token",
    user: { id: assignedUserId, idpRoles: ["FCP.Casework.Read"] },
  };

  it("finds cases assigned to the user in the session", async () => {
    const page = { data: { cases: [], pagination: {} } };
    findAll.mockResolvedValueOnce(page);

    const result = await findMyCasesUseCase(authContext, {});

    expect(findAll).toHaveBeenCalledOnce();
    expect(findAll).toHaveBeenCalledWith(authContext, { assignedUserId });
    expect(result).toEqual(page);
  });

  it("uses the session user over an assignedUserId in the query", async () => {
    findAll.mockResolvedValueOnce({});

    await findMyCasesUseCase(authContext, {
      assignedUserId: "60c72b2f9b1e8d001c8e4f5b",
    });

    expect(findAll).toHaveBeenCalledWith(authContext, { assignedUserId });
  });

  it("sends myCursor and myDirection as cursor and direction", async () => {
    findAll.mockResolvedValueOnce({});

    await findMyCasesUseCase(authContext, {
      cursor: "all-cases-cursor",
      direction: "backward",
      myCursor: "my-cases-cursor",
      myDirection: "forward",
    });

    expect(findAll).toHaveBeenCalledWith(authContext, {
      cursor: "my-cases-cursor",
      direction: "forward",
      assignedUserId,
    });
  });

  it("passes search and sort through", async () => {
    findAll.mockResolvedValueOnce({});

    await findMyCasesUseCase(authContext, {
      search: "CASE-1",
      createdAt: "asc",
    });

    expect(findAll).toHaveBeenCalledWith(authContext, {
      search: "CASE-1",
      createdAt: "asc",
      assignedUserId,
    });
  });

  it("finds cases when called without a query", async () => {
    findAll.mockResolvedValueOnce({});

    await findMyCasesUseCase(authContext);

    expect(findAll).toHaveBeenCalledWith(authContext, { assignedUserId });
  });

  it.each([
    ["no user", { token: "mock-token" }],
    ["no user id", { token: "mock-token", user: { idpRoles: [] } }],
  ])(
    "throws unauthorised without calling the backend when there is %s",
    async (_, context) => {
      await expect(findMyCasesUseCase(context, {})).rejects.toMatchObject({
        output: { statusCode: 401 },
      });
      expect(findAll).not.toHaveBeenCalled();
    },
  );

  it("propagates repository errors", async () => {
    findAll.mockRejectedValueOnce(new Error("Repository failed"));

    await expect(findMyCasesUseCase(authContext, {})).rejects.toThrow(
      "Repository failed",
    );
  });
});

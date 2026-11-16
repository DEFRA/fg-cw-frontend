import Boom from "@hapi/boom";
import { describe, expect, it, vi } from "vitest";
import { findByCaseType } from "../repositories/case.repository.js";
import { findCasesByTypeUseCase } from "./find-cases-by-type.use-case.js";

vi.mock("../repositories/case.repository.js");

const authContext = { token: "mock-token" };

describe("findCasesByTypeUseCase", () => {
  it("returns cases from the repository", async () => {
    const mockPage = { data: { cases: [{ _id: "1" }], pagination: {} } };
    findByCaseType.mockResolvedValue(mockPage);

    const result = await findCasesByTypeUseCase(authContext, "woodland", {
      search: "test",
    });

    expect(findByCaseType).toHaveBeenCalledWith(authContext, "woodland", {
      search: "test",
    });
    expect(result).toEqual(mockPage);
  });

  it("maps a 404 backend error to a Boom.notFound", async () => {
    findByCaseType.mockRejectedValue(Boom.notFound("Not Found"));

    const error = await findCasesByTypeUseCase(
      authContext,
      "MISSING",
      {},
    ).catch((e) => e);

    expect(error.isBoom).toBe(true);
    expect(error.output.statusCode).toBe(404);
    expect(error.message).toContain("MISSING");
  });

  it("maps a 403 backend error to a Boom.forbidden", async () => {
    findByCaseType.mockRejectedValue(Boom.forbidden("Forbidden"));

    const error = await findCasesByTypeUseCase(
      authContext,
      "RESTRICTED",
      {},
    ).catch((e) => e);

    expect(error.isBoom).toBe(true);
    expect(error.output.statusCode).toBe(403);
    expect(error.message).toContain("RESTRICTED");
  });

  it("rethrows unknown errors unchanged", async () => {
    const unknownError = new Error("Network failure");
    findByCaseType.mockRejectedValue(unknownError);

    await expect(
      findCasesByTypeUseCase(authContext, "woodland", {}),
    ).rejects.toThrow("Network failure");
  });
});

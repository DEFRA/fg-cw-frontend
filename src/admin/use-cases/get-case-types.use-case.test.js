import { describe, expect, it, vi } from "vitest";
import { getCaseTypes } from "../repositories/case-type.repository.js";
import { getCaseTypesUseCase } from "./get-case-types.use-case.js";

vi.mock("../repositories/case-type.repository.js");

describe("getCaseTypesUseCase", () => {
  it("returns case types from the repository", async () => {
    const authContext = { token: "mock-token" };
    const page = { data: [{ code: "woodland" }], header: { navItems: [] } };

    getCaseTypes.mockResolvedValue(page);

    const result = await getCaseTypesUseCase(authContext);

    expect(getCaseTypes).toHaveBeenCalledWith(authContext);
    expect(result).toEqual(page);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { wreck } from "../../common/wreck.js";
import { getCaseTypes } from "./case-type.repository.js";

vi.mock("../../common/wreck.js");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getCaseTypes", () => {
  const authContext = { token: "mock-token" };

  it("gets case types", async () => {
    const mockPage = {
      header: { navItems: [] },
      data: [{ code: "woodland" }],
    };

    wreck.get.mockResolvedValue({
      payload: mockPage,
    });

    const result = await getCaseTypes(authContext);

    expect(wreck.get).toHaveBeenCalledWith("/case-types", {
      headers: {
        authorization: `Bearer ${authContext.token}`,
      },
    });
    expect(result).toEqual(mockPage);
  });
});

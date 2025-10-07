import { describe, expect, test, vi } from "vitest";
import { wreck } from "../../common/wreck.js";
import { findSecretUseCase } from "./find-secret.use-case.js";

vi.mock("../../common/wreck.js");

describe("findSecretUseCase", () => {
  test("returns updated task when repository succeeds", async () => {
    wreck.get.mockResolvedValue({
      payload: {
        idpId: "12345678-1234-1234-1234-123456789012",
      },
    });

    const authContext = {
      token: "mockAccessToken",
    };

    const result = await findSecretUseCase(authContext);

    expect(wreck.get).toHaveBeenCalledWith(`/secret`, {
      headers: {
        Authorization: `Bearer ${authContext.token}`,
      },
    });

    expect(result).toEqual({
      idpId: "12345678-1234-1234-1234-123456789012",
    });
  });
});

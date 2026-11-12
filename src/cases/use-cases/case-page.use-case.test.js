import { describe, expect, it, vi } from "vitest";
import { saveCaseGroup } from "../repositories/case-page.repository.js";
import { saveCaseGroupUseCase } from "./case-page.use-case.js";

vi.mock("../repositories/case-page.repository.js");
describe("save case group", () => {
  it("submits owner and every enabled label together, treating Not set as clear", async () => {
    const auth = { token: "t" };
    const identity = { caseType: "t", pageKey: "p", keyHash: "h" };
    await saveCaseGroupUseCase(auth, identity, {
      assignee: "",
      "label-123": JSON.stringify({
        code: "DUPLICATE",
        data: { duplicateOf: "456" },
      }),
      "label-456": "",
      crumb: "not-a-label",
    });
    expect(saveCaseGroup).toHaveBeenCalledWith(auth, identity, {
      assignee: null,
      labels: {
        123: { code: "DUPLICATE", data: { duplicateOf: "456" } },
        456: null,
      },
    });
  });
  it("refuses an invalid select value before calling the API", () => {
    expect(() =>
      saveCaseGroupUseCase({}, {}, { "label-123": "invalid JSON" }),
    ).toThrow("Choose a valid case label");
    expect(saveCaseGroup).not.toHaveBeenCalled();
  });
});

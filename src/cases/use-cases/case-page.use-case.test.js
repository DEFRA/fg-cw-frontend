import { describe, expect, it, vi } from "vitest";
import { saveCaseGroup } from "../repositories/case-page.repository.js";
import { saveCaseGroupUseCase } from "./case-page.use-case.js";
vi.mock("../repositories/case-page.repository.js");
describe("case group form transport", () => {
  it("forwards choices unchanged without decoding label semantics", async () => {
    const auth = { token: "t" };
    const identity = { caseType: "t", pageKey: "p", groupKey: "g" };
    const form = {
      assignee: "",
      "label-123": "opaque-choice",
      "label-456": "",
    };
    await saveCaseGroupUseCase(auth, identity, form);
    expect(saveCaseGroup).toHaveBeenCalledWith(auth, identity, { form });
  });
  it("leaves validation of any submitted token to the backend", async () => {
    const form = {
      assignee: "",
      "label-123": "not JSON and not a domain object",
    };
    await saveCaseGroupUseCase({}, {}, form);
    expect(saveCaseGroup).toHaveBeenCalledWith({}, {}, { form });
  });
});

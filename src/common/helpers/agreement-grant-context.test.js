import { describe, expect, test, vi } from "vitest";
import {
  agreementGrantContextsKey,
  findAgreementGrantCode,
  rememberAgreementGrantContexts,
} from "./agreement-grant-context.js";

const createRequest = function (initialContexts = []) {
  let contexts = initialContexts;
  return {
    yar: {
      get: vi.fn(() => contexts),
      set: vi.fn((key, value) => {
        contexts = value;
      }),
    },
  };
};

describe("agreement grant context", () => {
  test("remembers grant codes by agreement reference without replacing other agreements", () => {
    const request = createRequest([
      { agreementRef: "ALPHA-001", grantCode: "alpha-grant" },
    ]);

    rememberAgreementGrantContexts(request, [
      { agreementRef: "BETA-002", grantCode: "beta-grant" },
    ]);

    expect(request.yar.set).toHaveBeenCalledWith(agreementGrantContextsKey, [
      { agreementRef: "ALPHA-001", grantCode: "alpha-grant" },
      { agreementRef: "BETA-002", grantCode: "beta-grant" },
    ]);
  });

  test.each([
    ["ALPHA-001", "alpha-grant"],
    ["ALPHA-001/print", "alpha-grant"],
    ["BETA-002", "beta-grant"],
    ["BETA-002/print", "beta-grant"],
  ])("finds the actual grant code for %s", (path, expectedGrantCode) => {
    const request = createRequest([
      { agreementRef: "ALPHA-001", grantCode: "alpha-grant" },
      { agreementRef: "BETA-002", grantCode: "beta-grant" },
    ]);

    expect(findAgreementGrantCode(request, path)).toBe(expectedGrantCode);
  });

  test("does not infer a grant code from an unknown agreement path", () => {
    const request = createRequest([
      { agreementRef: "ALPHA-001", grantCode: "alpha-grant" },
    ]);

    expect(findAgreementGrantCode(request, "PMF999999/print")).toBeUndefined();
  });
});

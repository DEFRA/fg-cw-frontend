import { createAll } from "govuk-frontend";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyToClipboard } from "../../common/components/copy-to-clipboard/copy-to-clipboard.js";
import { ExpandableText } from "../../common/components/expandable-text/expandable-text.js";

vi.mock("govuk-frontend");

describe("application.js", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("should import all required GOV.UK Frontend components", async () => {
    await import("./application.js");

    expect(createAll).toHaveBeenCalledTimes(2);
    expect(createAll).toHaveBeenCalledWith(ExpandableText);
    expect(createAll).toHaveBeenCalledWith(CopyToClipboard);
  });
});

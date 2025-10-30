import {
  Accordion,
  Button,
  Checkboxes,
  createAll,
  ErrorSummary,
  Header,
  Radios,
  SkipLink,
  Tabs,
} from "govuk-frontend";
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

    expect(createAll).toHaveBeenCalledTimes(10);
    expect(createAll).toHaveBeenCalledWith(Accordion);
    expect(createAll).toHaveBeenCalledWith(Button);
    expect(createAll).toHaveBeenCalledWith(Checkboxes);
    expect(createAll).toHaveBeenCalledWith(ErrorSummary);
    expect(createAll).toHaveBeenCalledWith(Header);
    expect(createAll).toHaveBeenCalledWith(Radios);
    expect(createAll).toHaveBeenCalledWith(SkipLink);
    expect(createAll).toHaveBeenCalledWith(Tabs);
    expect(createAll).toHaveBeenCalledWith(ExpandableText);
    expect(createAll).toHaveBeenCalledWith(CopyToClipboard);
  });

  it("should initialize components in the correct order", async () => {
    await import("./application.js");

    expect(createAll).toHaveBeenNthCalledWith(1, Accordion);
    expect(createAll).toHaveBeenNthCalledWith(2, Button);
    expect(createAll).toHaveBeenNthCalledWith(3, Checkboxes);
    expect(createAll).toHaveBeenNthCalledWith(4, ErrorSummary);
    expect(createAll).toHaveBeenNthCalledWith(5, Header);
    expect(createAll).toHaveBeenNthCalledWith(6, Radios);
    expect(createAll).toHaveBeenNthCalledWith(7, SkipLink);
    expect(createAll).toHaveBeenNthCalledWith(8, Tabs);
  });
});

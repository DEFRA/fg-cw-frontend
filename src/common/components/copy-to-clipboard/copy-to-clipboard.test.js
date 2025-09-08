import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "../../nunjucks/render.js";
import { CopyToClipboard } from "./copy-to-clipboard.js";

describe("CopyToClipboard", () => {
  let button;
  let feedbackTag;
  let component;
  let mockClipboard;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = "";

    // Mock clipboard API
    mockClipboard = {
      writeText: vi.fn(),
    };
    Object.defineProperty(navigator, "clipboard", {
      value: mockClipboard,
      writable: true,
    });

    // Render component using Nunjucks template
    const html = render("copy-to-clipboard", {
      text: "test@example.com",
      buttonText: "Copy",
      feedbackText: "Copied to clipboard",
    });

    document.body.innerHTML = html;

    // Get DOM elements
    button = document.querySelector(".copy-to-clipboard-button");
    feedbackTag = document.querySelector(".copy-to-clipboard-feedback");

    // Mock console.error
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("handleCopy", () => {
    beforeEach(() => {
      component = new CopyToClipboard(button);
    });

    it("should copy text to clipboard successfully", async () => {
      mockClipboard.writeText.mockResolvedValue();
      const showSuccessSpy = vi.spyOn(component, "showSuccess");

      const event = new Event("click");

      await component.handleCopy(event);

      expect(mockClipboard.writeText).toHaveBeenCalledWith("test@example.com");
      expect(showSuccessSpy).toHaveBeenCalled();
    });

    it("should handle clipboard write failure", async () => {
      mockClipboard.writeText.mockRejectedValue(new Error("Clipboard error"));
      const showErrorSpy = vi.spyOn(component, "showError");

      const event = new Event("click");
      await component.handleCopy(event);

      expect(mockClipboard.writeText).toHaveBeenCalledWith("test@example.com");
      expect(showErrorSpy).toHaveBeenCalled();
      // eslint-disable-next-line no-console
      expect(console.error).toHaveBeenCalledWith(
        "Failed to copy text: ",
        expect.any(Error),
      );
    });
  });

  describe("showSuccess", () => {
    beforeEach(() => {
      component = new CopyToClipboard(button);
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should disable button and show success feedback", () => {
      const announceToScreenReaderSpy = vi.spyOn(
        component,
        "announceToScreenReader",
      );

      component.showSuccess();

      expect(button.disabled).toBe(true);
      expect(feedbackTag.className).toBe(
        "govuk-tag govuk-tag--green copy-to-clipboard-feedback",
      );
      expect(feedbackTag.style.display).toBe("inline-block");
      expect(announceToScreenReaderSpy).toHaveBeenCalledWith(
        "Copied to clipboard",
      );
    });

    it("should re-enable button and hide feedback after timeout", () => {
      component.showSuccess();

      vi.advanceTimersByTime(2000);

      expect(button.disabled).toBe(false);
      expect(feedbackTag.style.display).toBe("none");
    });

    it("should handle missing feedback tag gracefully", () => {
      component.$feedbackTag = null;

      expect(() => component.showSuccess()).not.toThrow();
      expect(button.disabled).toBe(true);
    });
  });

  describe("showError", () => {
    beforeEach(() => {
      component = new CopyToClipboard(button);
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should disable button and show error feedback", () => {
      const announceToScreenReaderSpy = vi.spyOn(
        component,
        "announceToScreenReader",
      );
      const originalText = feedbackTag.textContent;

      component.showError();

      expect(button.disabled).toBe(true);
      expect(feedbackTag.textContent).toBe("Failed to copy");
      expect(feedbackTag.className).toBe(
        "govuk-tag govuk-tag--red copy-to-clipboard-feedback",
      );
      expect(feedbackTag.style.display).toBe("inline-block");
      expect(announceToScreenReaderSpy).toHaveBeenCalledWith("Failed to copy");

      // After timeout, should restore original text
      vi.advanceTimersByTime(2000);
      expect(feedbackTag.textContent).toBe(originalText);
    });

    it("should re-enable button and hide feedback after timeout", () => {
      component.showError();

      vi.advanceTimersByTime(2000);

      expect(button.disabled).toBe(false);
      expect(feedbackTag.style.display).toBe("none");
    });

    it("should handle missing feedback tag gracefully", () => {
      component.$feedbackTag = null;

      expect(() => component.showError()).not.toThrow();
      expect(button.disabled).toBe(true);
    });
  });

  it("should create aria-live region if it doesn't exist", () => {
    component.announceToScreenReader("Test message");

    const liveRegion = document.getElementById("copy-clipboard-announcer");
    expect(liveRegion).toBeTruthy();
    expect(liveRegion.getAttribute("aria-live")).toBe("polite");
    expect(liveRegion.getAttribute("aria-atomic")).toBe("true");
    expect(liveRegion.id).toBe("copy-clipboard-announcer");
    expect(document.body.contains(liveRegion)).toBe(true);
  });

  it("should have correct module name", () => {
    expect(CopyToClipboard.moduleName).toBe("copy-to-clipboard");
  });

  it("should handle complete copy flow", async () => {
    mockClipboard.writeText.mockResolvedValue();
    component = new CopyToClipboard(button);

    // Simulate click
    button.click();

    // Wait for async operations
    await vi.waitFor(() => {
      expect(feedbackTag.style.display).toBe("inline-block");
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith("test@example.com");
    expect(button.disabled).toBe(true);
    expect(feedbackTag.className).toContain("govuk-tag--green");
  });
});

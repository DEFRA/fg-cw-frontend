/**
 * JavaScript enhancements for the Copy to Clipboard component
 *
 * @preserve
 */
export class CopyToClipboard {
  /**
   * @param {Element | null} $root - HTML element to use for copy to clipboard
   */
  constructor($root) {
    this.$root = $root;
    this.$button = this.$root;
    this.$feedbackTag = this.$root?.parentElement?.querySelector(
      ".copy-to-clipboard-feedback",
    );
    this.originalText = this.$button?.textContent;
    this.init();
  }

  /**
   * Initialize event listeners
   *
   * @private
   */
  init() {
    if (this.$button) {
      this.$button.addEventListener("click", (event) => this.handleCopy(event));
    }
  }

  /**
   * Handle copy button click
   *
   * @private
   * @param {MouseEvent} event - Click event
   */
  async handleCopy(event) {
    event.preventDefault();

    const textToCopy = this.$button.dataset.text;

    try {
      await navigator.clipboard.writeText(textToCopy);
      this.showSuccess();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to copy text: ", err);
      this.showError();
    }
  }

  /**
   * Show success feedback
   *
   * @private
   */
  showSuccess() {
    this.$button.disabled = true;

    // Show success tag
    if (this.$feedbackTag) {
      this.$feedbackTag.className =
        "govuk-tag govuk-tag--green copy-to-clipboard-feedback";
      this.$feedbackTag.style.display = "inline-block";
    }

    // Screen reader announcement
    this.announceToScreenReader("Copied to clipboard");

    setTimeout(() => {
      if (this.$feedbackTag) {
        this.$feedbackTag.style.display = "none";
      }
      this.$button.disabled = false;
    }, 2000);
  }

  /**
   * Show error feedback
   *
   * @private
   */
  showError() {
    this.$button.disabled = true;
    let originalText = null;

    // Show error tag
    if (this.$feedbackTag) {
      originalText = this.$feedbackTag.textContent;
      this.$feedbackTag.textContent = "Failed to copy";
      this.$feedbackTag.className =
        "govuk-tag govuk-tag--red copy-to-clipboard-feedback";
      this.$feedbackTag.style.display = "inline-block";
    }

    // Screen reader announcement
    this.announceToScreenReader("Failed to copy");

    setTimeout(() => {
      if (this.$feedbackTag) {
        this.$feedbackTag.style.display = "none";
        this.$feedbackTag.textContent = originalText;
      }
      this.$button.disabled = false;
    }, 2000);
  }

  /**
   * Announce message to screen readers
   *
   * @private
   * @param {string} message - Message to announce
   */
  announceToScreenReader(message) {
    // Create or reuse aria-live region
    let liveRegion = document.getElementById("copy-clipboard-announcer");
    if (!liveRegion) {
      liveRegion = document.createElement("div");
      liveRegion.id = "copy-clipboard-announcer";
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      liveRegion.className = "govuk-visually-hidden";
      document.body.appendChild(liveRegion);
    }

    // Clear and set message
    liveRegion.textContent = "";
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 200);
  }

  /**
   * Name for the component used when initialising using data-module attributes.
   */
  static moduleName = "copy-to-clipboard";
}

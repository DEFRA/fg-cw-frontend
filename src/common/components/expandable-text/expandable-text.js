/**
 * JavaScript enhancements for the Expandable Text component
 *
 * @preserve
 */
export class ExpandableText {
  /**
   * @param {Element | null} $root - HTML element to use for expandable text
   */
  constructor($root) {
    this.$root = $root;
    this.$toggle = this.$root.querySelector(".expandable-text__toggle");
    this.$content = this.$root.querySelector(".expandable-text__content");
    this.$fullContent = this.$root.querySelector(
      ".expandable-text__full-content",
    );

    if (this.$toggle) {
      this.$toggle.addEventListener("click", (event) =>
        this.handleToggle(event),
      );
    }
  }

  /**
   * Handle toggle click
   *
   * @private
   * @param {MouseEvent} event - Click event
   */
  handleToggle(event) {
    event.preventDefault();
    this.expand();
  }

  /**
   * Expand the text
   *
   * @private
   */
  expand() {
    this.$toggle.setAttribute("aria-expanded", "true");
    this.$content.textContent = this.$fullContent.textContent;
    this.$toggle.style.display = "none";
  }

  /**
   * Name for the component used when initialising using data-module attributes.
   */
  static moduleName = "expandable-text";
}

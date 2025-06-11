import { beforeEach, describe, expect, test } from "vitest";
import { initSelectAllCheckboxes } from "./checkbox-select-all.js";

describe("initSelectAllCheckboxes", () => {
  beforeEach(() => {
    // Clear the DOM before each test
    document.body.innerHTML = "";
  });

  describe("Basic functionality", () => {
    beforeEach(() => {
      // Set up the DOM structure
      document.body.innerHTML = `
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" id="select_all_allcases" name="select_all" value="all"/></th>
            </tr>
          </thead>
          <tbody>
            <tr><td><input type="checkbox" name="selected_cases" id="case1_allcases" /></td></tr>
            <tr><td><input type="checkbox" name="selected_cases" id="case2_allcases" /></td></tr>
          </tbody>
        </table>
      `;
    });

    test('should check all row checkboxes when "select all" is checked', () => {
      initSelectAllCheckboxes();

      const selectAll = document.querySelector("#select_all_allcases");
      const rowCheckboxes = document.querySelectorAll(
        'input[name="selected_cases"]',
      );

      selectAll.checked = true;
      selectAll.dispatchEvent(new Event("change"));

      rowCheckboxes.forEach((cb) => {
        expect(cb.checked).toBe(true);
      });
      expect(selectAll.indeterminate).toBe(false);
    });

    test('should uncheck all row checkboxes when "select all" is unchecked', () => {
      initSelectAllCheckboxes();

      const selectAll = document.querySelector("#select_all_allcases");
      const rowCheckboxes = document.querySelectorAll(
        'input[name="selected_cases"]',
      );

      // First check them all
      selectAll.checked = true;
      selectAll.dispatchEvent(new Event("change"));

      // Now uncheck
      selectAll.checked = false;
      selectAll.dispatchEvent(new Event("change"));

      rowCheckboxes.forEach((cb) => {
        expect(cb.checked).toBe(false);
      });
      expect(selectAll.indeterminate).toBe(false);
    });

    test("should set indeterminate when some but not all checkboxes are checked", () => {
      initSelectAllCheckboxes();

      const selectAll = document.querySelector("#select_all_allcases");
      const rowCheckboxes = document.querySelectorAll(
        'input[name="selected_cases"]',
      );

      rowCheckboxes[0].checked = true;
      rowCheckboxes[0].dispatchEvent(new Event("change"));

      expect(selectAll.checked).toBe(false);
      expect(selectAll.indeterminate).toBe(true);
    });

    test('should check the "select all" box if all checkboxes are checked manually', () => {
      initSelectAllCheckboxes();

      const selectAll = document.querySelector("#select_all_allcases");
      const rowCheckboxes = document.querySelectorAll(
        'input[name="selected_cases"]',
      );

      rowCheckboxes.forEach((cb) => {
        cb.checked = true;
        cb.dispatchEvent(new Event("change"));
      });

      expect(selectAll.checked).toBe(true);
      expect(selectAll.indeterminate).toBe(false);
    });

    test('should uncheck "select all" when all checkboxes are unchecked manually', () => {
      initSelectAllCheckboxes();

      const selectAll = document.querySelector("#select_all_allcases");
      const rowCheckboxes = document.querySelectorAll(
        'input[name="selected_cases"]',
      );

      // First check all
      rowCheckboxes.forEach((cb) => {
        cb.checked = true;
        cb.dispatchEvent(new Event("change"));
      });

      // Then uncheck all
      rowCheckboxes.forEach((cb) => {
        cb.checked = false;
        cb.dispatchEvent(new Event("change"));
      });

      expect(selectAll.checked).toBe(false);
      expect(selectAll.indeterminate).toBe(false);
    });
  });

  describe("Initial state setting", () => {
    test("should set initial state to unchecked when no row checkboxes are checked", () => {
      document.body.innerHTML = `
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" id="select_all_allcases" name="select_all" value="all"/></th>
            </tr>
          </thead>
          <tbody>
            <tr><td><input type="checkbox" name="selected_cases" /></td></tr>
            <tr><td><input type="checkbox" name="selected_cases" /></td></tr>
          </tbody>
        </table>
      `;

      initSelectAllCheckboxes();

      const selectAll = document.querySelector("#select_all_allcases");
      expect(selectAll.checked).toBe(false);
      expect(selectAll.indeterminate).toBe(false);
    });

    test("should set initial state to checked when all row checkboxes are checked", () => {
      document.body.innerHTML = `
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" id="select_all_allcases" name="select_all" value="all"/></th>
            </tr>
          </thead>
          <tbody>
            <tr><td><input type="checkbox" name="selected_cases" checked /></td></tr>
            <tr><td><input type="checkbox" name="selected_cases" checked /></td></tr>
          </tbody>
        </table>
      `;

      initSelectAllCheckboxes();

      const selectAll = document.querySelector("#select_all_allcases");
      expect(selectAll.checked).toBe(true);
      expect(selectAll.indeterminate).toBe(false);
    });

    test("should set initial state to indeterminate when some row checkboxes are checked", () => {
      document.body.innerHTML = `
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" id="select_all_allcases" name="select_all" value="all"/></th>
            </tr>
          </thead>
          <tbody>
            <tr><td><input type="checkbox" name="selected_cases" checked /></td></tr>
            <tr><td><input type="checkbox" name="selected_cases" /></td></tr>
            <tr><td><input type="checkbox" name="selected_cases" /></td></tr>
          </tbody>
        </table>
      `;

      initSelectAllCheckboxes();

      const selectAll = document.querySelector("#select_all_allcases");
      expect(selectAll.checked).toBe(false);
      expect(selectAll.indeterminate).toBe(true);
    });
  });

  describe("Edge cases", () => {
    test("should handle select-all checkbox not inside a table", () => {
      document.body.innerHTML = `
        <div>
          <input type="checkbox" id="select_all_allcases" name="select_all" value="all"/>
          <input type="checkbox" name="selected_cases" />
        </div>
      `;

      // Should not throw an error
      expect(() => initSelectAllCheckboxes()).not.toThrow();

      const selectAll = document.querySelector("#select_all_allcases");
      // Should not have event listeners attached since it's not in a table
      selectAll.checked = true;
      selectAll.dispatchEvent(new Event("change"));

      // The checkbox outside the table should not be affected
      const otherCheckbox = document.querySelector(
        'input[name="selected_cases"]',
      );
      expect(otherCheckbox.checked).toBe(false);
    });

    test("should handle table with no row checkboxes", () => {
      document.body.innerHTML = `
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" id="select_all_allcases" name="select_all" value="all"/></th>
            </tr>
          </thead>
          <tbody>
            <tr><td>No checkboxes here</td></tr>
          </tbody>
        </table>
      `;

      expect(() => initSelectAllCheckboxes()).not.toThrow();

      const selectAll = document.querySelector("#select_all_allcases");
      expect(selectAll.checked).toBe(false);
      expect(selectAll.indeterminate).toBe(false);

      // Should handle change event without errors
      selectAll.checked = true;
      selectAll.dispatchEvent(new Event("change"));
      expect(selectAll.indeterminate).toBe(false);
    });

    test("should handle single row checkbox", () => {
      document.body.innerHTML = `
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" id="select_all_allcases" name="select_all" value="all"/></th>
            </tr>
          </thead>
          <tbody>
            <tr><td><input type="checkbox" name="selected_cases" /></td></tr>
          </tbody>
        </table>
      `;

      initSelectAllCheckboxes();

      const selectAll = document.querySelector("#select_all_allcases");
      const rowCheckbox = document.querySelector(
        'input[name="selected_cases"]',
      );

      // Test checking the single row checkbox
      rowCheckbox.checked = true;
      rowCheckbox.dispatchEvent(new Event("change"));

      expect(selectAll.checked).toBe(true);
      expect(selectAll.indeterminate).toBe(false);

      // Test unchecking the single row checkbox
      rowCheckbox.checked = false;
      rowCheckbox.dispatchEvent(new Event("change"));

      expect(selectAll.checked).toBe(false);
      expect(selectAll.indeterminate).toBe(false);
    });

    test("should handle multiple tables with select-all checkboxes", () => {
      document.body.innerHTML = `
        <table id="table1">
          <thead>
            <tr>
              <th><input type="checkbox" id="select_all_table1" name="select_all" value="all"/></th>
            </tr>
          </thead>
          <tbody>
            <tr><td><input type="checkbox" name="selected_cases" /></td></tr>
            <tr><td><input type="checkbox" name="selected_cases" /></td></tr>
          </tbody>
        </table>
        <table id="table2">
          <thead>
            <tr>
              <th><input type="checkbox" id="select_all_table2" name="select_all" value="all"/></th>
            </tr>
          </thead>
          <tbody>
            <tr><td><input type="checkbox" name="selected_cases" /></td></tr>
            <tr><td><input type="checkbox" name="selected_cases" /></td></tr>
          </tbody>
        </table>
      `;

      initSelectAllCheckboxes();

      const selectAll1 = document.querySelector("#select_all_table1");
      const selectAll2 = document.querySelector("#select_all_table2");
      const table1Checkboxes = document.querySelectorAll(
        '#table1 input[name="selected_cases"]',
      );
      const table2Checkboxes = document.querySelectorAll(
        '#table2 input[name="selected_cases"]',
      );

      // Check select-all for table1
      selectAll1.checked = true;
      selectAll1.dispatchEvent(new Event("change"));

      // Only table1 checkboxes should be checked
      table1Checkboxes.forEach((cb) => {
        expect(cb.checked).toBe(true);
      });
      table2Checkboxes.forEach((cb) => {
        expect(cb.checked).toBe(false);
      });
      expect(selectAll2.checked).toBe(false);
    });

    test("should handle select-all checkbox with different value attribute", () => {
      document.body.innerHTML = `
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" id="select_all_different" name="select_all" value="different"/></th>
            </tr>
          </thead>
          <tbody>
            <tr><td><input type="checkbox" name="selected_cases" /></td></tr>
          </tbody>
        </table>
      `;

      initSelectAllCheckboxes();

      const selectAll = document.querySelector("#select_all_different");
      const rowCheckbox = document.querySelector(
        'input[name="selected_cases"]',
      );

      // Should not be initialized since value is not "all"
      selectAll.checked = true;
      selectAll.dispatchEvent(new Event("change"));

      expect(rowCheckbox.checked).toBe(false);
    });

    test("should handle empty table body", () => {
      document.body.innerHTML = `
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" id="select_all_allcases" name="select_all" value="all"/></th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      `;

      expect(() => initSelectAllCheckboxes()).not.toThrow();

      const selectAll = document.querySelector("#select_all_allcases");
      expect(selectAll.checked).toBe(false);
      expect(selectAll.indeterminate).toBe(false);
    });
  });

  describe("Complex interactions", () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <table>
          <thead>
            <tr>
              <th><input type="checkbox" id="select_all_allcases" name="select_all" value="all"/></th>
            </tr>
          </thead>
          <tbody>
            <tr><td><input type="checkbox" name="selected_cases" id="case1" /></td></tr>
            <tr><td><input type="checkbox" name="selected_cases" id="case2" /></td></tr>
            <tr><td><input type="checkbox" name="selected_cases" id="case3" /></td></tr>
          </tbody>
        </table>
      `;
    });

    test("should handle rapid state changes", () => {
      initSelectAllCheckboxes();

      const selectAll = document.querySelector("#select_all_allcases");
      const rowCheckboxes = document.querySelectorAll(
        'input[name="selected_cases"]',
      );

      // Rapid changes
      selectAll.checked = true;
      selectAll.dispatchEvent(new Event("change"));

      rowCheckboxes[0].checked = false;
      rowCheckboxes[0].dispatchEvent(new Event("change"));

      rowCheckboxes[1].checked = false;
      rowCheckboxes[1].dispatchEvent(new Event("change"));

      rowCheckboxes[2].checked = false;
      rowCheckboxes[2].dispatchEvent(new Event("change"));

      expect(selectAll.checked).toBe(false);
      expect(selectAll.indeterminate).toBe(false);
    });

    test("should handle checking and unchecking individual items in sequence", () => {
      initSelectAllCheckboxes();

      const selectAll = document.querySelector("#select_all_allcases");
      const rowCheckboxes = document.querySelectorAll(
        'input[name="selected_cases"]',
      );

      // Check items one by one
      rowCheckboxes[0].checked = true;
      rowCheckboxes[0].dispatchEvent(new Event("change"));
      expect(selectAll.indeterminate).toBe(true);

      rowCheckboxes[1].checked = true;
      rowCheckboxes[1].dispatchEvent(new Event("change"));
      expect(selectAll.indeterminate).toBe(true);

      rowCheckboxes[2].checked = true;
      rowCheckboxes[2].dispatchEvent(new Event("change"));
      expect(selectAll.checked).toBe(true);
      expect(selectAll.indeterminate).toBe(false);

      // Uncheck items one by one
      rowCheckboxes[0].checked = false;
      rowCheckboxes[0].dispatchEvent(new Event("change"));
      expect(selectAll.checked).toBe(false);
      expect(selectAll.indeterminate).toBe(true);

      rowCheckboxes[1].checked = false;
      rowCheckboxes[1].dispatchEvent(new Event("change"));
      expect(selectAll.indeterminate).toBe(true);

      rowCheckboxes[2].checked = false;
      rowCheckboxes[2].dispatchEvent(new Event("change"));
      expect(selectAll.checked).toBe(false);
      expect(selectAll.indeterminate).toBe(false);
    });
  });

  describe("No select-all checkboxes", () => {
    test("should handle page with no select-all checkboxes", () => {
      document.body.innerHTML = `
        <table>
          <tbody>
            <tr><td><input type="checkbox" name="selected_cases" /></td></tr>
          </tbody>
        </table>
      `;

      expect(() => initSelectAllCheckboxes()).not.toThrow();
    });

    test("should handle empty page", () => {
      document.body.innerHTML = "";
      expect(() => initSelectAllCheckboxes()).not.toThrow();
    });
  });
});

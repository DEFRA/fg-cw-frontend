export const initSelectAllCheckboxes = () => {
  const selectAllCheckboxes = document.querySelectorAll(
    'input[name="select_all"][value="all"]',
  );

  selectAllCheckboxes.forEach((selectAllCheckbox) => {
    const table = selectAllCheckbox.closest("table");
    if (!table) {
      return;
    }

    const rowCheckboxes = table.querySelectorAll(
      'tbody input[name="selected_cases"]',
    );

    // Handler for select-all checkbox
    selectAllCheckbox.addEventListener("change", (event) => {
      const isChecked = event.target.checked;
      selectAllCheckbox.indeterminate = false;

      updateRowCheckboxes(rowCheckboxes, isChecked);
    });

    // Handler for individual row checkboxes
    rowCheckboxes.forEach((rowCheckbox) => {
      rowCheckbox.addEventListener("change", () => {
        updateSelectAllState(selectAllCheckbox, rowCheckboxes);
      });
    });

    // Set initial state on load
    updateSelectAllState(selectAllCheckbox, rowCheckboxes);
  });
};

const updateRowCheckboxes = (rowCheckboxes, isChecked) => {
  rowCheckboxes.forEach((rowCheckbox) => {
    rowCheckbox.checked = isChecked;
  });
};

const updateSelectAllState = (selectAllCheckbox, rowCheckboxes) => {
  const selectedCheckboxes = Array.from(rowCheckboxes).filter(
    (checkbox) => checkbox.checked,
  );
  const selectedCheckboxCount = selectedCheckboxes.length;
  const hasSelectedCheckboxes = selectedCheckboxCount > 0;

  selectAllCheckbox.checked =
    hasSelectedCheckboxes && selectedCheckboxCount === rowCheckboxes.length;
  selectAllCheckbox.indeterminate =
    hasSelectedCheckboxes && selectedCheckboxCount < rowCheckboxes.length;
};

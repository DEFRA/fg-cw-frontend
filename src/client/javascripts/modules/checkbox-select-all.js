export function initSelectAllCheckboxes() {
  const selectAllCheckboxes = document.querySelectorAll('[data-select-all]')

  selectAllCheckboxes.forEach((selectAllCheckbox) => {
    const suffix = selectAllCheckbox.dataset.selectAll || ''
    const table = selectAllCheckbox.closest('table')
    if (!table) return

    const rowCheckboxes = table.querySelectorAll(
      `tbody input[name="selected_cases"][id$="${suffix}"]`
    )
    if (rowCheckboxes.length === 0) return

    // Select all logic
    selectAllCheckbox.addEventListener('change', (event) => {
      const isChecked = event.target.checked
      rowCheckboxes.forEach((cb) => {
        cb.checked = isChecked
      })
    })

    // Update "select all" state when rows change
    rowCheckboxes.forEach((cb) => {
      cb.addEventListener('change', () => {
        const allChecked = Array.from(rowCheckboxes).every((c) => c.checked)
        const someChecked = Array.from(rowCheckboxes).some((c) => c.checked)

        selectAllCheckbox.checked = allChecked
        selectAllCheckbox.indeterminate = !allChecked && someChecked
      })
    })

    // Initial state
    const allChecked = Array.from(rowCheckboxes).every((c) => c.checked)
    const someChecked = Array.from(rowCheckboxes).some((c) => c.checked)

    selectAllCheckbox.checked = allChecked
    selectAllCheckbox.indeterminate = !allChecked && someChecked
  })
}

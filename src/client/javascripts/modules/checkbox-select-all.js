export function initSelectAllCheckboxes() {
  const selectAllCheckboxes = document.querySelectorAll(
    'input[name="select_all"][value="all"]'
  )

  selectAllCheckboxes.forEach((selectAllCheckbox) => {
    const table = selectAllCheckbox.closest('table')
    if (!table) return

    const rowCheckboxes = table.querySelectorAll(
      'tbody input[name="selected_cases"]'
    )

    // Handler for select-all checkbox
    selectAllCheckbox.addEventListener('change', (event) => {
      const isChecked = event.target.checked
      selectAllCheckbox.indeterminate = false

      rowCheckboxes.forEach((rowCheckbox) => {
        rowCheckbox.checked = isChecked
      })
    })

    // Handler for individual row checkboxes
    rowCheckboxes.forEach((rowCheckbox) => {
      rowCheckbox.addEventListener('change', () => {
        const total = rowCheckboxes.length
        const checkedCount = Array.from(rowCheckboxes).filter(
          (cb) => cb.checked
        ).length

        if (checkedCount === 0) {
          selectAllCheckbox.checked = false
          selectAllCheckbox.indeterminate = false
        } else if (checkedCount === total) {
          selectAllCheckbox.checked = true
          selectAllCheckbox.indeterminate = false
        } else {
          selectAllCheckbox.checked = false
          selectAllCheckbox.indeterminate = true
        }
      })
    })

    // Set initial state on load
    const total = rowCheckboxes.length
    const checkedCount = Array.from(rowCheckboxes).filter(
      (cb) => cb.checked
    ).length

    if (checkedCount === 0) {
      selectAllCheckbox.checked = false
      selectAllCheckbox.indeterminate = false
    } else if (checkedCount === total) {
      selectAllCheckbox.checked = true
      selectAllCheckbox.indeterminate = false
    } else {
      selectAllCheckbox.checked = false
      selectAllCheckbox.indeterminate = true
    }
  })
}

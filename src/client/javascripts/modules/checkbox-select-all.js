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

    selectAllCheckbox.addEventListener('change', (event) => {
      const isChecked = event.target.checked
      rowCheckboxes.forEach((cb) => {
        cb.checked = isChecked
      })
    })

    rowCheckboxes.forEach((cb) => {
      cb.addEventListener('change', () => {
        if (!cb.checked) {
          selectAllCheckbox.checked = false
        } else {
          const allChecked = Array.from(rowCheckboxes).every((c) => c.checked)
          selectAllCheckbox.checked = allChecked
        }
      })
    })

    // Init checkbox state on load
    const allCheckedOnInit = Array.from(rowCheckboxes).every((cb) => cb.checked)
    selectAllCheckbox.checked = allCheckedOnInit
  })
}

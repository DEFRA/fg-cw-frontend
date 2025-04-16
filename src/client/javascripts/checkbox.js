document.addEventListener('DOMContentLoaded', function () {
  const selectAllCheckboxes = document.querySelectorAll(
    'input[name="select_all"][value="all"]'
  )

  selectAllCheckboxes.forEach(function (selectAllCheckbox) {
    const table = selectAllCheckbox.closest('table')
    if (!table) {
      return
    }

    const rowCheckboxes = table.querySelectorAll(
      'tbody input[name="selected_cases"]'
    )

    selectAllCheckbox.addEventListener('change', function (event) {
      const isChecked = event.target.checked

      rowCheckboxes.forEach(function (rowCheckbox) {
        rowCheckbox.checked = isChecked
      })
    })

    rowCheckboxes.forEach(function (rowCheckbox) {
      rowCheckbox.addEventListener('change', function () {
        if (!this.checked) {
          selectAllCheckbox.checked = false
        } else {
          let allChecked = true
          rowCheckboxes.forEach(function (cb) {
            if (!cb.checked) {
              allChecked = false
            }
          })
          selectAllCheckbox.checked = allChecked
        }
      })
    })

    let allCheckedOnInit = rowCheckboxes.length > 0
    rowCheckboxes.forEach(function (cb) {
      if (!cb.checked) {
        allCheckedOnInit = false
      }
    })
    if (allCheckedOnInit) {
      selectAllCheckbox.checked = true
    }
  })
})

/**
 * @jest-environment jsdom
 */

import { initSelectAllCheckboxes } from './checkbox-select-all.js'

describe('initSelectAllCheckboxes', () => {
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
    `
  })

  it('should check all row checkboxes when "select all" is checked', () => {
    initSelectAllCheckboxes()

    const selectAll = document.querySelector('#select_all_allcases')
    const rowCheckboxes = document.querySelectorAll(
      'input[name="selected_cases"]'
    )

    selectAll.checked = true
    selectAll.dispatchEvent(new Event('change'))

    rowCheckboxes.forEach((cb) => {
      expect(cb.checked).toBe(true)
    })
  })

  it('should uncheck all row checkboxes when "select all" is unchecked', () => {
    initSelectAllCheckboxes()

    const selectAll = document.querySelector('#select_all_allcases')
    const rowCheckboxes = document.querySelectorAll(
      'input[name="selected_cases"]'
    )

    // First check them all
    selectAll.checked = true
    selectAll.dispatchEvent(new Event('change'))

    // Now uncheck
    selectAll.checked = false
    selectAll.dispatchEvent(new Event('change'))

    rowCheckboxes.forEach((cb) => {
      expect(cb.checked).toBe(false)
    })
  })

  it('should set indeterminate when some but not all checkboxes are checked', () => {
    initSelectAllCheckboxes()
  
    const selectAll = document.querySelector('#select_all_allcases')
    const rowCheckboxes = document.querySelectorAll(
      'input[name="selected_cases"]'
    )
  
    rowCheckboxes[0].checked = true
    rowCheckboxes[0].dispatchEvent(new Event('change'))
  
    expect(selectAll.checked).toBe(false)
    expect(selectAll.indeterminate).toBe(true)
  })  
  

  it('should check the "select all" box if all checkboxes are checked manually', () => {
    initSelectAllCheckboxes()

    const selectAll = document.querySelector('#select_all_allcases')
    const rowCheckboxes = document.querySelectorAll(
      'input[name="selected_cases"]'
    )

    rowCheckboxes.forEach((cb) => {
      cb.checked = true
      cb.dispatchEvent(new Event('change'))
    })

    expect(selectAll.checked).toBe(true)
    expect(selectAll.indeterminate).toBe(false)
  })
})

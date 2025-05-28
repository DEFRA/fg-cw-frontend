import { describe, test, expect, beforeEach } from 'vitest'
import { renderComponent } from '~/src/server/common/test-helpers/component-helpers.js'

describe('Task Details', () => {
  let $taskDetails

  const mockParams = {
    caseId: '123',
    groupId: 'group1',
    taskId: 'task1',
    groups: [
      {
        id: 'group1',
        tasks: [
          {
            id: 'task1',
            title: 'Test Task',
            type: 'boolean'
          }
        ]
      }
    ]
  }

  describe('Component', () => {
    beforeEach(() => {
      $taskDetails = renderComponent('taskDetails', mockParams)
    })

    test('Should render task details component with expected heading', () => {
      expect($taskDetails('h2')).toHaveLength(1)
      expect($taskDetails('h2').text().trim()).toBe('Test Task')
    })

    test('Should render back link with correct attributes', () => {
      const backLink = $taskDetails('[data-testid="back-link"]')
      expect(backLink).toHaveLength(1)
      expect(backLink.attr('href')).toBe('/case/123')
      expect(backLink.text().trim()).toBe('Back to task list')
    })

    test('Should render checkbox for boolean task type', () => {
      expect($taskDetails('.govuk-checkboxes')).toHaveLength(1)
      expect($taskDetails('.govuk-checkboxes__label').text().trim()).toBe(
        'Is application ready to be reviewed?'
      )
    })

    test('Should render save and continue button', () => {
      const saveButton = $taskDetails(
        '[data-testid="save-and-continue-button"]'
      )
      expect(saveButton).toHaveLength(1)
      expect(saveButton.text().trim()).toBe('Save and continue')
      expect(saveButton.attr('href')).toBe('/case/123')
    })
  })
})

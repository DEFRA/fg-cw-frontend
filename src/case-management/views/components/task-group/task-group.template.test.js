import { describe, test, expect, beforeEach } from 'vitest'
import { renderComponent } from '../../../../server/common/test-helpers/component-helpers.js'

describe('Task Groups', () => {
  let $taskGroups

  const mockParams = {
    caseId: '123',
    stage: {
      title: 'Test Stage',
      groups: [
        {
          title: 'Group 1',
          tasks: [
            {
              title: 'Task 1',
              status: 'not started',
              link: '/case/123/task/1'
            },
            {
              title: 'Task 2',
              status: 'in progress',
              link: '/case/123/task/2'
            }
          ]
        }
      ],
      actions: [
        {
          label: 'Complete Stage',
          nextStage: 'complete'
        }
      ]
    }
  }

  describe('Component', () => {
    beforeEach(() => {
      $taskGroups = renderComponent('taskGroups', mockParams)
    })

    test('Should render stage heading', () => {
      expect($taskGroups('h2')).toHaveLength(1)
      expect($taskGroups('h2').text().trim()).toBe('Test Stage')
    })

    test('Should render group heading with correct number', () => {
      expect($taskGroups('h3')).toHaveLength(1)
      expect($taskGroups('h3').text().trim()).toBe('1. Group 1')
    })

    test('Should render task list with correct number of tasks', () => {
      expect($taskGroups('[data-testid="taskList-list"]')).toHaveLength(1)
      expect($taskGroups('[data-testid="taskList-li"]')).toHaveLength(2)
    })

    test('Should render task links with correct text and href', () => {
      const taskLinks = $taskGroups('.govuk-task-list__link')
      expect(taskLinks).toHaveLength(2)
      expect(taskLinks.eq(0).text().trim()).toBe('Task 1')
      expect(taskLinks.eq(0).attr('href')).toBe('/case/123/task/1')
      expect(taskLinks.eq(1).text().trim()).toBe('Task 2')
      expect(taskLinks.eq(1).attr('href')).toBe('/case/123/task/2')
    })

    test('Should render correct status tags', () => {
      const statusTags = $taskGroups('.govuk-tag')
      expect(statusTags).toHaveLength(2)
      expect(statusTags.eq(0).text().trim()).toBe('Not started')
      expect(statusTags.eq(1).text().trim()).toBe('In progress')
    })

    test('Should render stage action button', () => {
      const actionButton = $taskGroups('.govuk-button')
      expect(actionButton).toHaveLength(1)
      expect(actionButton.text().trim()).toBe('Complete Stage')
      expect(actionButton.attr('formaction')).toBe('/case/123')
    })
  })
})

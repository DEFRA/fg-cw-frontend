import { describe, test, expect, beforeEach } from 'vitest'
import { renderComponent } from '../../test-helpers/component-helpers.js'

describe('Task List', () => {
  let $taskList

  const mockParams = {
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
      },
      {
        title: 'Task 3',
        status: 'completed',
        link: '/case/123/task/3'
      }
    ]
  }

  describe('Component', () => {
    beforeEach(() => {
      $taskList = renderComponent('taskList', mockParams)
    })

    test('Should render task list with correct number of tasks', () => {
      expect($taskList('[data-testid="taskList-list"]')).toHaveLength(1)
      expect($taskList('[data-testid="taskList-li"]')).toHaveLength(3)
    })

    test('Should render task links with correct text and href', () => {
      const taskLinks = $taskList('.govuk-task-list__link')
      expect(taskLinks).toHaveLength(3)
      expect(taskLinks.eq(0).text().trim()).toBe('Task 1')
      expect(taskLinks.eq(0).attr('href')).toBe('/case/123/task/1')
      expect(taskLinks.eq(1).text().trim()).toBe('Task 2')
      expect(taskLinks.eq(1).attr('href')).toBe('/case/123/task/2')
      expect(taskLinks.eq(2).text().trim()).toBe('Task 3')
      expect(taskLinks.eq(2).attr('href')).toBe('/case/123/task/3')
    })

    test('Should render correct status tags', () => {
      const statusTags = $taskList('.govuk-tag')
      expect(statusTags).toHaveLength(3)
      expect(statusTags.eq(0).text().trim()).toBe('Not started')
      expect(statusTags.eq(1).text().trim()).toBe('In progress')
      expect(statusTags.eq(2).text().trim()).toBe('Completed')
    })

    test('Should not render task list when tasks array is empty', () => {
      const emptyTaskList = renderComponent('taskList', { tasks: [] })
      expect(emptyTaskList('[data-testid="taskList-list"]')).toHaveLength(0)
    })
  })
})

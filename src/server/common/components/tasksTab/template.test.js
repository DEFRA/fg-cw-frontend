import { describe, test, expect, beforeEach } from 'vitest'
import { renderComponent } from '../../test-helpers/component-helpers.js'

describe('Tasks Tab', () => {
  let $tasksTab

  const mockParams = {
    caseId: '123',
    taskId: 'task1',
    groupId: 'group1',
    currentTask: {
      id: 'task1',
      title: 'Task 1',
      description: 'hello',
      status: 'not started',
      link: '/case/123/task/1'
    },
    stage: {
      title: 'Test Stage',
      groups: [
        {
          id: 'group1',
          title: 'Group 1',
          tasks: [
            {
              id: 'task1',
              title: 'Task 1',
              description: 'hello',
              status: 'not started',
              link: '/case/123/task/1'
            }
          ]
        }
      ]
    }
  }

  describe('Component', () => {
    beforeEach(() => {
      $tasksTab = renderComponent('tasksTab', mockParams)
    })

    test('Should render task details when taskId is provided', () => {
      expect($tasksTab('[data-testid="task-details-heading"]')).toHaveLength(1)
      expect(
        $tasksTab('[data-testid="task-details-heading"]').text().trim()
      ).toBe('Task 1')
    })

    test('Should render task groups when taskId is not provided', () => {
      const paramsWithoutTaskId = { ...mockParams }
      delete paramsWithoutTaskId.taskId
      const $tasksTabWithoutTaskId = renderComponent(
        'tasksTab',
        paramsWithoutTaskId
      )

      expect(
        $tasksTabWithoutTaskId('[data-testid="stage-heading"]')
      ).toHaveLength(1)
      expect(
        $tasksTabWithoutTaskId('[data-testid="stage-heading"]').text().trim()
      ).toBe('Test Stage')
    })

    test('Should pass correct props to task details component', () => {
      const taskDetailsComponent = $tasksTab(
        '[data-testid="task-details-heading"]'
      )
      expect(taskDetailsComponent).toHaveLength(1)
      expect(taskDetailsComponent.text().trim()).toBe('Task 1')
    })

    test('Should pass correct props to task groups component', () => {
      const paramsWithoutTaskId = { ...mockParams }
      delete paramsWithoutTaskId.taskId
      const $tasksTabWithoutTaskId = renderComponent(
        'tasksTab',
        paramsWithoutTaskId
      )

      const stageHeading = $tasksTabWithoutTaskId(
        '[data-testid="stage-heading"]'
      )
      expect(stageHeading).toHaveLength(1)
      expect(stageHeading.text().trim()).toBe('Test Stage')
    })
  })
})

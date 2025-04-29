import { renderComponent } from '~/src/server/common/test-helpers/component-helpers.js'

describe('Task List Component', () => {
  /** @type {CheerioAPI} */
  let $taskList

  const tasks = [
    {
      heading: 'Check application',
      tasks: [
        {
          label: 'Check application and documents',
          link: '/cases/APPLICATION-REF-1/task-group/1',
          status: 'COMPLETED'
        },
        {
          label: 'Check for dual funding',
          link: '/cases/APPLICATION-REF-1/task-group/2',
          status: 'NOT STARTED'
        }
      ]
    },
    {
      heading: 'Make Application Decision',
      tasks: [
        {
          label: 'Approve or reject application',
          link: '/cases/APPLICATION-REF-1/task-group/1',
          status: 'NOT STARTED'
        }
      ]
    }
  ]

  beforeEach(() => {
    $taskList = renderComponent('taskList', {
      taskSteps: tasks
    })
  })

  test('Should not render taskList component', () => {
    $taskList = renderComponent('taskList', { taskSteps: [] })
    expect($taskList('[data-testid="taskList-heading"]')).toHaveLength(0)
  })

  test('Should render header for taskList component', () => {
    expect($taskList('[data-testid="taskList-heading"]')).toHaveLength(1)
  })

  test('Should render list items', () => {
    expect($taskList('[data-testid="taskList-li"]')).toHaveLength(3)
  })

  test('Should render task label', () => {
    expect($taskList('[data-testid="taskList-list"]').text().trim()).toContain(
      'Check for dual funding'
    )
  })
})
/**
 * @import { CheerioAPI } from 'cheerio'
 */

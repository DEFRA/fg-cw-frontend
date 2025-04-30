import { renderComponent } from '~/src/server/common/test-helpers/component-helpers.js'

describe('Task List Component', () => {
  /** @type {CheerioAPI} */
  let $taskList

  const tasks = [
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

  beforeEach(() => {
    $taskList = renderComponent('taskList', { tasks })
  })

  test('Should render task list', () => {
    expect($taskList('[data-testid="taskList-li"]')).toHaveLength(2)
  })
})

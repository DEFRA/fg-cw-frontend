import { renderComponent } from '~/src/server/common/test-helpers/component-helpers.js'

describe('Tasks Tab Component', () => {
  /** @type {CheerioAPI} */
  let $taskTab

  const tasks = [
    {
      label: 'Simple list approve or reject application',
      link: '/cases/APPLICATION-REF-1/task-group/1',
      status: 'NOT STARTED'
    },
    {
      label: 'Simple list approve or reject application 2',
      link: '/cases/APPLICATION-REF-1/task-group/1',
      status: 'NOT STARTED'
    }
  ]

  const taskSteps = [
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
    $taskTab = renderComponent('tasksTab', { taskSteps })
  })

  test('Should not render taskListStep component', () => {
    $taskTab = renderComponent('tasksTab', { taskSteps: [], tasks: [] })
    expect($taskTab('[data-testid="taskListSteps-li"]')).toHaveLength(0)
    expect($taskTab('h2')).toHaveLength(0)
  })

  test('Should render taskListStep component', () => {
    $taskTab = renderComponent('tasksTab', { taskSteps, tasks: [] })
    expect($taskTab('[data-testid="taskListSteps-li"]')).toHaveLength(3)
    expect($taskTab('h2')).toHaveLength(1)
  })

  test('Should not render taskList component', () => {
    $taskTab = renderComponent('tasksTab', { tasks: [], taskSteps: [] })
    expect($taskTab('[data-testid="taskList-li"]')).toHaveLength(0)
    expect($taskTab('h2')).toHaveLength(0)
  })

  test('Should render taskList component', () => {
    $taskTab = renderComponent('tasksTab', { tasks, taskSteps: [] })
    expect($taskTab('[data-testid="taskList-li"]')).toHaveLength(2)
    expect($taskTab('h2')).toHaveLength(1)
  })
})

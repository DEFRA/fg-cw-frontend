import { renderComponent } from '../../test-helpers/component-helpers.js'

describe('Task Groups Component', () => {
  /** @type {CheerioAPI} */
  let $taskGroups

  const stages = [
    {
      title: 'Application',
      groups: [
        {
          title: 'Check application',
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
          title: 'Make Application Decision',
          tasks: [
            {
              label: 'Approve or reject application',
              link: '/cases/APPLICATION-REF-1/task-group/1',
              status: 'NOT STARTED'
            }
          ]
        }
      ]
    }
  ]

  beforeEach(() => {
    $taskGroups = renderComponent('taskGroups', {
      stages: stages
    })
  })

  test('Should not render taskGroups component when no stages', () => {
    $taskGroups = renderComponent('taskGroups', { stages: [] })
    expect($taskGroups('[data-testid="stage-heading"]')).toHaveLength(0)
  })

  test('Should render stage headings', () => {
    expect($taskGroups('[data-testid="stage-heading"]')).toHaveLength(1)
    expect($taskGroups('[data-testid="stage-heading"]').text().trim()).toBe(
      'Application'
    )
  })

  test('Should render task content', () => {
    const text = $taskGroups('body').text()
    expect(text).toContain('Check application')
    expect(text).toContain('Make Application Decision')
    expect(text).toContain('Check for dual funding')
  })
})
/**
 * @import { CheerioAPI } from 'cheerio'
 */

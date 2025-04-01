/**
 * A GDS styled example about page controller.
 * Provided as an example, remove or modify as required.
 * @satisfies {Partial<ServerRoute>}
 */

export const applicationsData = {
  allCases: [
    {
      id: '100001',
      workflowId: '123',
      caseRef: 'CASE-REF-1',
      caseType: 'Water management R3',
      caseName: 'Northampton Reservoir',
      businessName: 'Farming Group Ltd',
      status: 'NEW',
      dateReceived: '2025-03-27T11:34:52Z',
      targetDate: '2025-04-27T11:34:52Z',
      priority: 'MEDIUM',
      assignedUser: 'Mark Ford',
      actionGroups: [
        {
          id: '1',
          actions: [
            {
              id: '1',
              tasks: [
                {
                  id: '1',
                  value: 'YES'
                },
                {
                  id: '2',
                  value: 'YES'
                }
              ],
              status: 'COMPLETED'
            },
            {
              id: '2',
              tasks: [
                {
                  id: '1',
                  value: null
                }
              ],
              status: 'NOT STARTED'
            }
          ]
        },
        {
          id: '2',
          actions: {
            id: '1',
            tasks: [
              {
                id: '1',
                value: null
              }
            ],
            status: 'CANNOT START YET'
          }
        }
      ]
    },
    {
      id: '100002',
      workflowId: '124',
      caseRef: 'CASE-REF-2',
      caseType: 'Water management R4',
      caseName: 'Yorkshire Reservoir',
      businessName: 'Hens Ltd',
      status: 'NEW',
      dateReceived: '2025-03-27T11:34:52Z',
      targetDate: '2025-04-27T11:34:52Z',
      priority: 'MEDIUM',
      assignedUser: 'Tej Powar',
      actionGroups: [
        {
          id: '1',
          actions: [
            {
              id: '1',
              tasks: [
                {
                  id: '1',
                  value: 'YES'
                },
                {
                  id: '2',
                  value: 'YES'
                }
              ],
              status: 'COMPLETED'
            },
            {
              id: '2',
              tasks: [
                {
                  id: '1',
                  value: null
                }
              ],
              status: 'NOT STARTED'
            }
          ]
        },
        {
          id: '2',
          actions: {
            id: '1',
            tasks: [
              {
                id: '1',
                value: null
              }
            ],
            status: 'CANNOT START YET'
          }
        }
      ]
    }
  ]
}

export const applicationsController = {
  handler(_request, h) {
    return h.view('applications/index', {
      pageTitle: 'Applications',
      heading: 'Applications',
      breadcrumbs: [
        {
          text: 'Home',
          href: '/'
        },
        {
          text: 'Applications'
        }
      ],
      data: {
        allCases: applicationsData.allCases
      }
    })
  }
}

/**
 * @import { ServerRoute } from '@hapi/hapi'
 */

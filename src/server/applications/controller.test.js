import { createServer } from '~/src/server/index.js'
import { statusCodes } from '~/src/server/common/constants/status-codes.js'
import { fetch } from 'undici'
import { config } from '../../config/config.js'

// Mock undici fetch
jest.mock('undici', () => ({
  fetch: jest.fn()
}))

describe('#applicationsController', () => {
  /** @type {Server} */
  let server

  beforeAll(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterAll(async () => {
    await server.stop({ timeout: 0 })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Should provide expected response with cases data', async () => {
    // Mock successful API response
    const mockCases = [
      {
        id: '100001',
        workflowId: '123',
        caseRef: 'GRANT-1',
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
            actions: [
              {
                id: '1',
                tasks: [
                  {
                    id: '1',
                    value: null
                  }
                ],
                status: 'CANNOT START YET'
              }
            ]
          }
        ]
      }
    ]

    // Set up the mock response
    const mockResponse = {
      json: jest.fn().mockResolvedValue({ data: mockCases })
    }
    fetch.mockResolvedValue(mockResponse)

    const { payload, statusCode } = await server.inject({
      method: 'GET',
      url: '/applications'
    })

    expect(statusCode).toBe(statusCodes.ok)
    expect(payload).toEqual(expect.stringContaining('Applications'))
    expect(payload).toEqual(expect.stringContaining('Farming Group Ltd'))
    expect(fetch).toHaveBeenCalledWith(
      `${config.get('fg_cw_backend_url')}/cases`
    )
  })

  test('Should handle API error gracefully', async () => {
    // Mock API error
    fetch.mockRejectedValueOnce(new Error('API Error'))

    const response = await server.inject({
      method: 'GET',
      url: '/applications'
    })

    expect(response.statusCode).toBe(statusCodes.ok)
    expect(response.payload).toEqual(expect.stringContaining('Applications'))
    expect(response.payload).toEqual(expect.stringContaining('All cases'))
    expect(fetch).toHaveBeenCalledWith(
      `${config.get('fg_cw_backend_url')}/cases`
    )
  })

  test('Should render page with correct breadcrumbs', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ data: [] })
    })

    const response = await server.inject({
      method: 'GET',
      url: '/applications'
    })

    expect(response.payload).toEqual(expect.stringContaining('Home'))
    expect(response.payload).toEqual(expect.stringContaining('Applications'))
  })

  test('Should render all three tabs', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ data: [] })
    })

    const response = await server.inject({
      method: 'GET',
      url: '/applications'
    })

    expect(response.payload).toEqual(expect.stringContaining('My cases'))
    expect(response.payload).toEqual(expect.stringContaining('Team cases'))
    expect(response.payload).toEqual(expect.stringContaining('All cases'))
  })

  // Place your new test HERE 👇
  test('Should render grouped and ungrouped tasks correctly in case view', async () => {
    const mockCase = {
      caseRef: 'GRANT-1',
      businessName: 'Farming Group Ltd',
      taskGroups: [
        { id: '1', title: 'Ungrouped Task A', status: 'NOT STARTED' },
        { id: '2', title: 'Grouped Task B', status: 'COMPLETED' }
      ],
      taskSections: [
        {
          title: 'Grouped Section',
          taskGroups: [
            { id: '2', title: 'Grouped Task B', status: 'COMPLETED' }
          ]
        }
      ],
      payload: {
        submittedAt: '2025-03-28T00:00:00Z',
        answers: {
          scheme: 'SFI',
          year: '2025',
          hasCheckedLandsUpToDate: true,
          actionApplications: [
            {
              parcelId: '9238',
              sheetId: 'SX0679',
              code: 'CSAM1',
              appliedFor: { quantity: '20.23', unit: 'ha' }
            }
          ]
        }
      }
    }

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockCase)
    })

    const response = await server.inject({
      method: 'GET',
      url: '/applications/GRANT-1'
    })

    expect(response.statusCode).toBe(statusCodes.ok)
    expect(response.payload).toContain('Grouped Section')
    expect(response.payload).toContain('Other tasks')
    expect(response.payload).toContain('Grouped Task B')
    expect(response.payload).toContain('Ungrouped Task A')
    expect(response.payload).toContain('Selected land parcel for action 1')
    expect(response.payload).toContain('20.23 ha')
  })
})

/**
 * @import { Server } from '@hapi/hapi'
 */

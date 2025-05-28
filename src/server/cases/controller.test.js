import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { casesController } from './controller.js'

// Mock dependencies
const mockFetch = vi.hoisted(() => vi.fn())
const mockConfig = vi.hoisted(() => ({
  get: vi.fn()
}))

vi.mock('undici', () => ({
  fetch: mockFetch
}))

vi.mock('../../config/config.js', () => ({
  config: mockConfig
}))

/**
 * @param {Partial<import('@hapi/hapi').Request>} [options]
 */
function mockRequest(options = {}) {
  return {
    params: {},
    payload: {},
    query: {},
    path: '/',
    ...options
  }
}

/**
 * @param {Partial<import('@hapi/hapi').ResponseToolkit>} [options]
 */
function mockResponseToolkit(options = {}) {
  const toolkit = {
    view: vi.fn().mockReturnThis(),
    response: vi.fn().mockReturnThis(),
    code: vi.fn().mockReturnThis(),
    ...options
  }
  return toolkit
}

describe('casesController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockConfig.get.mockReturnValue('http://localhost:3001')
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('handler (getCases)', () => {
    test('Should return cases view with data when API call succeeds', async () => {
      const mockCases = [
        { id: '1', name: 'Case 1' },
        { id: '2', name: 'Case 2' }
      ]

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({ data: mockCases })
      })

      const request = mockRequest()
      const h = mockResponseToolkit()

      await casesController.handler(request, h)

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/cases')
      expect(h.view).toHaveBeenCalledWith('cases/views/index', {
        pageTitle: 'Cases',
        heading: 'Cases',
        breadcrumbs: [],
        data: { allCases: mockCases }
      })
    })

    test('Should return cases view with empty array when API call fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const request = mockRequest()
      const h = mockResponseToolkit()

      await casesController.handler(request, h)

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/cases')
      expect(h.view).toHaveBeenCalledWith('cases/views/index', {
        pageTitle: 'Cases',
        heading: 'Cases',
        breadcrumbs: [],
        data: { allCases: [] }
      })
    })
  })

  describe('show', () => {
    const mockCase = {
      _id: 'case123',
      workflowCode: 'workflow1',
      currentStage: 'stage1',
      stages: [
        {
          id: 'stage1',
          taskGroups: [
            {
              id: 'group1',
              tasks: [{ id: 'task1', isComplete: false }]
            }
          ]
        }
      ]
    }

    const mockWorkflow = {
      stages: [
        {
          id: 'stage1',
          title: 'Stage 1 Title',
          actions: [{ label: 'Approve', nextStage: 'stage2' }],
          taskGroups: [
            {
              id: 'group1',
              title: 'Group 1 Title',
              tasks: [{ id: 'task1', title: 'Task 1 Title', type: 'form' }]
            }
          ]
        }
      ]
    }

    test('Should return case view with processed data when case and workflow exist', async () => {
      // Mock getCaseById
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockCase)
      })

      // Mock getWorkflowByCode
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockWorkflow)
      })

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/cases/case123'
      )
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/workflows/workflow1'
      )
      expect(h.view).toHaveBeenCalledWith('cases/views/show', {
        pageTitle: 'Application',
        caseData: expect.objectContaining({
          _id: 'case123',
          stages: expect.arrayContaining([
            expect.objectContaining({
              title: 'Stage 1 Title',
              actions: mockWorkflow.stages[0].actions
            })
          ])
        }),
        stage: expect.objectContaining({
          title: 'Stage 1 Title',
          actions: mockWorkflow.stages[0].actions,
          groups: expect.arrayContaining([
            expect.objectContaining({
              id: 'group1',
              title: 'Group 1 Title',
              tasks: expect.arrayContaining([
                expect.objectContaining({
                  id: 'task1',
                  title: 'Task 1 Title',
                  type: 'form',
                  link: '/case/case123/tasks/group1/task1',
                  status: 'INCOMPLETE'
                })
              ])
            })
          ])
        }),
        query: {}
      })
    })

    test('Should return 404 when case is not found', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Not found'))

      const request = mockRequest({ params: { id: 'nonexistent' } })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(h.response).toHaveBeenCalledWith('Case not found')
      expect(h.code).toHaveBeenCalledWith(404)
    })

    test('Should return 404 when workflow is not found', async () => {
      // Mock getCaseById success
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockCase)
      })

      // Mock getWorkflowByCode failure
      mockFetch.mockRejectedValueOnce(new Error('Workflow not found'))

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(h.response).toHaveBeenCalledWith('Workflow not found')
      expect(h.code).toHaveBeenCalledWith(404)
    })

    test('Should handle case without workflow code', async () => {
      const caseWithoutWorkflow = { ...mockCase, workflowCode: null }

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(caseWithoutWorkflow)
      })

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(h.response).toHaveBeenCalledWith('Workflow not found')
      expect(h.code).toHaveBeenCalledWith(404)
    })

    test('Should include caseDetails tab query when path contains caseDetails', async () => {
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockCase)
      })

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockWorkflow)
      })

      const request = mockRequest({
        params: { id: 'case123' },
        path: '/case/case123/caseDetails'
      })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(h.view).toHaveBeenCalledWith(
        'cases/views/show',
        expect.objectContaining({
          query: { tab: 'caseDetails' }
        })
      )
    })

    test('Should handle completed tasks correctly', async () => {
      const caseWithCompletedTask = {
        ...mockCase,
        stages: [
          {
            id: 'stage1',
            taskGroups: [
              {
                id: 'group1',
                tasks: [{ id: 'task1', isComplete: true }]
              }
            ]
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(caseWithCompletedTask)
      })

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockWorkflow)
      })

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(h.view).toHaveBeenCalledWith(
        'cases/views/show',
        expect.objectContaining({
          stage: expect.objectContaining({
            groups: expect.arrayContaining([
              expect.objectContaining({
                tasks: expect.arrayContaining([
                  expect.objectContaining({
                    status: 'COMPLETE'
                  })
                ])
              })
            ])
          })
        })
      )
    })
  })

  describe('showTask', () => {
    const mockCase = {
      _id: 'case123',
      workflowCode: 'workflow1',
      currentStage: 'stage1',
      stages: [
        {
          id: 'stage1',
          taskGroups: [
            {
              id: 'group1',
              tasks: [{ id: 'task1', isComplete: false }]
            }
          ]
        }
      ]
    }

    const mockWorkflow = {
      stages: [
        {
          id: 'stage1',
          title: 'Stage 1 Title',
          taskGroups: [
            {
              id: 'group1',
              title: 'Group 1 Title',
              tasks: [{ id: 'task1', title: 'Task 1 Title', type: 'form' }]
            }
          ]
        }
      ]
    }

    test('Should return task view with correct query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockCase)
      })

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockWorkflow)
      })

      const request = mockRequest({
        params: {
          id: 'case123',
          groupId: 'group1',
          taskId: 'task1'
        }
      })
      const h = mockResponseToolkit()

      await casesController.showTask(request, h)

      expect(h.view).toHaveBeenCalledWith(
        'cases/views/show',
        expect.objectContaining({
          query: { groupId: 'group1', taskId: 'task1' }
        })
      )
    })

    test('Should return 400 when case ID is missing', async () => {
      const request = mockRequest({ params: {} })
      const h = mockResponseToolkit()

      await casesController.showTask(request, h)

      expect(h.response).toHaveBeenCalledWith('Case ID is required')
      expect(h.code).toHaveBeenCalledWith(400)
    })

    test('Should return 404 when case is not found', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Not found'))

      const request = mockRequest({
        params: {
          id: 'nonexistent',
          groupId: 'group1',
          taskId: 'task1'
        }
      })
      const h = mockResponseToolkit()

      await casesController.showTask(request, h)

      expect(h.response).toHaveBeenCalledWith('Case not found')
      expect(h.code).toHaveBeenCalledWith(404)
    })
  })

  describe('updateStage', () => {
    const mockCase = {
      _id: 'case123',
      workflowCode: 'workflow1',
      currentStage: 'stage1',
      stages: [
        {
          id: 'stage1',
          taskGroups: [
            {
              id: 'group1',
              tasks: [{ id: 'task1', isComplete: false }]
            }
          ]
        }
      ]
    }

    const mockWorkflow = {
      stages: [
        {
          id: 'stage1',
          title: 'Stage 1 Title',
          taskGroups: [
            {
              id: 'group1',
              title: 'Group 1 Title',
              tasks: [{ id: 'task1', title: 'Task 1 Title', type: 'form' }]
            }
          ]
        }
      ]
    }

    test('Should update stage and return updated case view', async () => {
      // Mock getCaseById
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockCase)
      })

      // Mock updateStageAsync
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue({ success: true })
      })

      // Mock getCaseById for showCase
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockCase)
      })

      // Mock getWorkflowByCode for showCase
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockWorkflow)
      })

      const request = mockRequest({
        params: { id: 'case123' },
        payload: { nextStage: 'stage2' }
      })
      const h = mockResponseToolkit()

      await casesController.updateStage(request, h)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/case/case123/stage',
        {
          method: 'POST',
          body: JSON.stringify({ nextStage: 'stage2' })
        }
      )
      expect(h.view).toHaveBeenCalledWith(
        'cases/views/show',
        expect.any(Object)
      )
    })

    test('Should return 404 when case is not found', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Not found'))

      const request = mockRequest({
        params: { id: 'nonexistent' },
        payload: { nextStage: 'stage2' }
      })
      const h = mockResponseToolkit()

      await casesController.updateStage(request, h)

      expect(h.response).toHaveBeenCalledWith('Case not found')
      expect(h.code).toHaveBeenCalledWith(404)
    })

    test('Should handle updateStageAsync failure gracefully', async () => {
      // Mock getCaseById success
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockCase)
      })

      // Mock updateStageAsync failure
      mockFetch.mockRejectedValueOnce(new Error('Update failed'))

      // Mock getCaseById for showCase
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockCase)
      })

      // Mock getWorkflowByCode for showCase
      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockWorkflow)
      })

      const request = mockRequest({
        params: { id: 'case123' },
        payload: { nextStage: 'stage2' }
      })
      const h = mockResponseToolkit()

      // Should not throw and should still return the case view
      await expect(
        casesController.updateStage(request, h)
      ).resolves.not.toThrow()
      expect(h.view).toHaveBeenCalledWith(
        'cases/views/show',
        expect.any(Object)
      )
    })
  })

  describe('Edge cases and error handling', () => {
    test('Should handle case with no stages', async () => {
      const caseWithoutStages = {
        _id: 'case123',
        workflowCode: 'workflow1',
        currentStage: 'stage1',
        stages: []
      }

      const mockWorkflow = {
        stages: []
      }

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(caseWithoutStages)
      })

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockWorkflow)
      })

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(h.view).toHaveBeenCalledWith(
        'cases/views/show',
        expect.objectContaining({
          stage: null
        })
      )
    })

    test('Should handle case with stage not found in current stage', async () => {
      const caseWithMismatchedStage = {
        _id: 'case123',
        workflowCode: 'workflow1',
        currentStage: 'nonexistent-stage',
        stages: [
          {
            id: 'stage1',
            taskGroups: []
          }
        ]
      }

      const mockWorkflow = {
        stages: [
          {
            id: 'stage1',
            title: 'Stage 1 Title',
            taskGroups: []
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(caseWithMismatchedStage)
      })

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockWorkflow)
      })

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(h.view).toHaveBeenCalledWith(
        'cases/views/show',
        expect.objectContaining({
          stage: null
        })
      )
    })

    test('Should handle workflow stage without taskGroups', async () => {
      const mockCase = {
        _id: 'case123',
        workflowCode: 'workflow1',
        currentStage: 'stage1',
        stages: [
          {
            id: 'stage1',
            taskGroups: []
          }
        ]
      }

      const mockWorkflow = {
        stages: [
          {
            id: 'stage1',
            title: 'Stage 1 Title'
            // No taskGroups property
          }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockCase)
      })

      mockFetch.mockResolvedValueOnce({
        json: vi.fn().mockResolvedValue(mockWorkflow)
      })

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(h.view).toHaveBeenCalledWith(
        'cases/views/show',
        expect.objectContaining({
          stage: expect.objectContaining({
            title: 'Stage 1 Title',
            groups: []
          })
        })
      )
    })
  })
})

/**
 * @import { Request, ResponseToolkit, ServerRoute } from '@hapi/hapi'
 */

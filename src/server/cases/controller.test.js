import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { casesController } from './controller.js'
import { createLogger } from '../common/helpers/logging/logger.js'
import { loggerOptions } from '../common/helpers/logging/logger-options.js'

// Mock dependencies
const mockWreck = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn()
}))

const mockConfig = vi.hoisted(() => ({
  get: vi.fn()
}))

vi.mock('../common/helpers/logging/logger.js')
vi.mock('../common/helpers/logging/logger-options.js', () => ({
  loggerOptions: {}
}))

vi.mock('../common/helpers/wreck.js', () => ({
  wreck: mockWreck
}))

vi.mock('../../config/config.js', () => ({
  config: mockConfig
}))

function mockRequest(options = {}) {
  return {
    params: {},
    payload: {},
    query: {},
    path: '/',
    ...options
  }
}

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
    it('Should return cases view with data when API call succeeds', async () => {
      const mockCases = [
        { id: '1', name: 'Case 1' },
        { id: '2', name: 'Case 2' }
      ]

      mockWreck.get.mockResolvedValueOnce({
        payload: { data: mockCases }
      })

      const request = mockRequest()
      const h = mockResponseToolkit()

      await casesController.handler(request, h)

      expect(mockWreck.get).toHaveBeenCalledWith('/cases')
      expect(h.view).toHaveBeenCalledWith('cases/views/index', {
        pageTitle: 'Cases',
        heading: 'Cases',
        breadcrumbs: [],
        data: { allCases: mockCases }
      })
    })

    it('Should return cases view with empty array when API call fails', async () => {
      mockWreck.get.mockRejectedValueOnce(new Error('Network error'))

      const request = mockRequest()
      const h = mockResponseToolkit()

      await casesController.handler(request, h)

      expect(mockWreck.get).toHaveBeenCalledWith('/cases')
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

    it('Should return case view with processed data when case and workflow exist', async () => {
      // Mock getCaseById
      mockWreck.get.mockResolvedValueOnce({
        payload: mockCase
      })

      // Mock getWorkflowByCode
      mockWreck.get.mockResolvedValueOnce({
        payload: mockWorkflow
      })

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(mockWreck.get).toHaveBeenCalledWith('/cases/case123')
      expect(mockWreck.get).toHaveBeenCalledWith('/workflows/workflow1')
      expect(h.view).toHaveBeenCalledWith('cases/views/show', {
        error: undefined,
        pageTitle: 'Case details',
        caseData: expect.objectContaining({
          _id: 'case123',
          stages: expect.arrayContaining([
            expect.objectContaining({
              title: 'Stage 1 Title',
              actions: mockWorkflow.stages[0].actions
            })
          ]),
          currentStage: 'stage1'
        }),
        stage: expect.objectContaining({
          title: 'Stage 1 Title',
          actions: mockWorkflow.stages[0].actions,
          tasksComplete: false,
          groups: expect.arrayContaining([
            expect.objectContaining({
              id: 'group1',
              title: 'Group 1 Title',
              description: undefined,
              tasks: expect.arrayContaining([
                expect.objectContaining({
                  id: 'task1',
                  title: 'Task 1 Title',
                  type: 'form',
                  link: '/case/case123/tasks/group1/task1',
                  status: 'INCOMPLETE',
                  isComplete: false,
                  description: undefined
                })
              ])
            })
          ])
        }),
        query: {}
      })
    })

    it('Should return 404 when case is not found', async () => {
      mockWreck.get.mockRejectedValueOnce(new Error('Not found'))

      const request = mockRequest({ params: { id: 'nonexistent' } })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(h.response).toHaveBeenCalledWith('Case not found')
      expect(h.code).toHaveBeenCalledWith(404)
    })

    it('Should return 404 when workflow is not found', async () => {
      // Mock getCaseById success
      mockWreck.get.mockResolvedValueOnce({
        payload: mockCase
      })

      // Mock getWorkflowByCode failure
      mockWreck.get.mockRejectedValueOnce(new Error('Workflow not found'))

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(h.response).toHaveBeenCalledWith('Workflow not found')
      expect(h.code).toHaveBeenCalledWith(404)
    })

    it('Should handle case without workflow code', async () => {
      const caseWithoutWorkflow = { ...mockCase, workflowCode: null }

      mockWreck.get.mockResolvedValueOnce({
        payload: caseWithoutWorkflow
      })

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(h.response).toHaveBeenCalledWith('Workflow not found')
      expect(h.code).toHaveBeenCalledWith(404)
    })

    it('Should include caseDetails tab query when path contains caseDetails', async () => {
      mockWreck.get.mockResolvedValueOnce({
        payload: mockCase
      })

      mockWreck.get.mockResolvedValueOnce({
        payload: mockWorkflow
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

    it('Should handle completed tasks correctly', async () => {
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

      mockWreck.get.mockResolvedValueOnce({
        payload: caseWithCompletedTask
      })

      mockWreck.get.mockResolvedValueOnce({
        payload: mockWorkflow
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

    it('Should return task view with correct query parameters', async () => {
      mockWreck.get.mockResolvedValueOnce({
        payload: mockCase
      })

      mockWreck.get.mockResolvedValueOnce({
        payload: mockWorkflow
      })

      const request = mockRequest({
        params: { id: 'case123', groupId: 'group1', taskId: 'task1' }
      })
      const h = mockResponseToolkit()

      await casesController.showTask(request, h)

      expect(h.view).toHaveBeenCalledWith(
        'cases/views/stage',
        expect.objectContaining({
          pageTitle: 'Case',
          query: { groupId: 'group1', taskId: 'task1' }
        })
      )
    })

    it('Should return 404 when case is not found', async () => {
      mockWreck.get.mockRejectedValueOnce(new Error('Not found'))

      const request = mockRequest({
        params: { id: 'nonexistent', groupId: 'group1', taskId: 'task1' }
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

    it('Should update stage and return updated case view', async () => {
      // Mock getCaseById
      mockWreck.get.mockResolvedValueOnce({
        payload: mockCase
      })

      // Mock updateStageAsync
      mockWreck.post.mockResolvedValueOnce({
        payload: { success: true }
      })

      // Mock getCaseById for showCase
      mockWreck.get.mockResolvedValueOnce({
        payload: mockCase
      })

      // Mock getWorkflowByCode for showCase
      mockWreck.get.mockResolvedValueOnce({
        payload: mockWorkflow
      })

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.updateStage(request, h)

      expect(mockWreck.post).toHaveBeenCalledWith('/cases/case123/stage')
      expect(h.view).toHaveBeenCalledWith(
        'cases/views/stage',
        expect.any(Object)
      )
    })

    it('Should return 404 when case is not found', async () => {
      mockWreck.get.mockRejectedValueOnce(new Error('Not found'))

      const request = mockRequest({ params: { id: 'nonexistent' } })
      const h = mockResponseToolkit()

      await casesController.updateStage(request, h)

      expect(h.response).toHaveBeenCalledWith('Case not found')
      expect(h.code).toHaveBeenCalledWith(404)
    })

    it('Should handle updateStageAsync failure gracefully', async () => {
      // Mock getCaseById success
      mockWreck.get.mockResolvedValueOnce({
        payload: mockCase
      })

      // Mock updateStageAsync failure
      mockWreck.post.mockRejectedValueOnce({
        data: { payload: 'Could not update' }
      })

      // Mock getCaseById for showCase
      mockWreck.get.mockResolvedValueOnce({
        payload: mockCase
      })

      // Mock getWorkflowByCode for showCase
      mockWreck.get.mockResolvedValueOnce({
        payload: mockWorkflow
      })

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.updateStage(request, h)

      expect(h.view).toHaveBeenCalledWith(
        'cases/views/stage',
        expect.any(Object)
      )
    })
  })

  describe('Edge cases and error handling', () => {
    it('Should handle case with no stages', async () => {
      const caseWithoutStages = {
        _id: 'case123',
        workflowCode: 'workflow1',
        currentStage: 'stage1',
        stages: []
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

      mockWreck.get.mockResolvedValueOnce({
        payload: caseWithoutStages
      })

      mockWreck.get.mockResolvedValueOnce({
        payload: mockWorkflow
      })

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(h.view).toHaveBeenCalledWith(
        'cases/views/show',
        expect.objectContaining({
          stage: {
            tasksComplete: true
          }
        })
      )
    })

    it('Should handle case with stage not found in current stage', async () => {
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

      mockWreck.get.mockResolvedValueOnce({
        payload: caseWithMismatchedStage
      })

      mockWreck.get.mockResolvedValueOnce({
        payload: mockWorkflow
      })

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(h.view).toHaveBeenCalledWith(
        'cases/views/show',
        expect.objectContaining({
          stage: {
            tasksComplete: true
          }
        })
      )
    })

    it('Should handle workflow stage without taskGroups', async () => {
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

      mockWreck.get.mockResolvedValueOnce({
        payload: mockCase
      })

      mockWreck.get.mockResolvedValueOnce({
        payload: mockWorkflow
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

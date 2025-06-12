import { describe, test, expect, vi, beforeEach } from 'vitest'
import { casesController } from './controller.js'
import { wreck } from '../common/helpers/wreck.js'

const mockConfig = vi.hoisted(() => ({
  get: vi.fn()
}))

vi.mock('../common/helpers/wreck.js')

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
    mockConfig.get.mockReturnValue('http://localhost:3001')
  })

  describe('handler (getCases)', () => {
    test('Should return cases view with data when API call succeeds', async () => {
      const mockCases = [
        { id: '1', name: 'Case 1' },
        { id: '2', name: 'Case 2' }
      ]

      wreck.get.mockResolvedValueOnce({
        payload: { data: mockCases }
      })

      const request = mockRequest()
      const h = mockResponseToolkit()

      await casesController.handler(request, h)

      expect(wreck.get).toHaveBeenCalledWith('/cases')
      expect(h.view).toHaveBeenCalledWith('cases/views/index', {
        pageTitle: 'Cases',
        heading: 'Cases',
        breadcrumbs: [],
        data: { allCases: mockCases }
      })
    })

    test('Should return cases view with empty array when API call fails', async () => {
      wreck.get.mockRejectedValueOnce(new Error('Network error'))

      const request = mockRequest()
      const h = mockResponseToolkit()

      await casesController.handler(request, h)

      expect(wreck.get).toHaveBeenCalledWith('/cases')
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
      wreck.get.mockResolvedValueOnce({
        payload: mockCase
      })

      // Mock getWorkflowByCode
      wreck.get.mockResolvedValueOnce({
        payload: mockWorkflow
      })

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(wreck.get).toHaveBeenCalledWith('/cases/case123')
      expect(wreck.get).toHaveBeenCalledWith('/workflows/workflow1')
      expect(h.view).toHaveBeenCalledWith('cases/views/show', {
        pageTitle: 'Case',
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
      wreck.get.mockRejectedValueOnce(new Error('Not found'))

      const request = mockRequest({ params: { id: 'nonexistent' } })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(h.response).toHaveBeenCalledWith('Case not found')
      expect(h.code).toHaveBeenCalledWith(404)
    })

    test('Should return 404 when workflow is not found', async () => {
      // Mock getCaseById success
      wreck.get.mockResolvedValueOnce({
        payload: mockCase
      })

      // Mock getWorkflowByCode failure
      wreck.get.mockRejectedValueOnce(new Error('Workflow not found'))

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(h.response).toHaveBeenCalledWith('Workflow not found')
      expect(h.code).toHaveBeenCalledWith(404)
    })

    test('Should handle case without workflow code', async () => {
      const caseWithoutWorkflow = { ...mockCase, workflowCode: null }

      wreck.get.mockResolvedValueOnce({
        payload: caseWithoutWorkflow
      })

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.show(request, h)

      expect(h.response).toHaveBeenCalledWith('Workflow not found')
      expect(h.code).toHaveBeenCalledWith(404)
    })

    test('Should include caseDetails tab query when path contains caseDetails', async () => {
      wreck.get.mockResolvedValueOnce({
        payload: mockCase
      })

      wreck.get.mockResolvedValueOnce({
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

      wreck.get.mockResolvedValueOnce({
        payload: caseWithCompletedTask
      })

      wreck.get.mockResolvedValueOnce({
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

    test('Should update stage and return updated case view', async () => {
      // Mock getCaseById
      wreck.get.mockResolvedValueOnce({
        payload: mockCase
      })

      // Mock updateStageAsync
      wreck.post.mockResolvedValueOnce({
        payload: { success: true }
      })

      // Mock getCaseById for showCase
      wreck.get.mockResolvedValueOnce({
        payload: mockCase
      })

      // Mock getWorkflowByCode for showCase
      wreck.get.mockResolvedValueOnce({
        payload: mockWorkflow
      })

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.updateStage(request, h)

      expect(wreck.post).toHaveBeenCalledWith('/cases/case123/stage')
      expect(h.view).toHaveBeenCalledWith(
        'cases/views/show',
        expect.any(Object)
      )
    })

    test('Should return 404 when case is not found', async () => {
      wreck.get.mockRejectedValueOnce(new Error('Not found'))

      const request = mockRequest({ params: { id: 'nonexistent' } })
      const h = mockResponseToolkit()

      await casesController.updateStage(request, h)

      expect(h.response).toHaveBeenCalledWith('Case not found')
      expect(h.code).toHaveBeenCalledWith(404)
    })

    test('Should handle updateStageAsync failure gracefully', async () => {
      // Mock getCaseById success
      wreck.get.mockResolvedValueOnce({
        payload: mockCase
      })

      // Mock updateStageAsync failure
      wreck.post.mockRejectedValueOnce(new Error('Update failed'))

      // Mock getCaseById for showCase
      wreck.get.mockResolvedValueOnce({
        payload: mockCase
      })

      // Mock getWorkflowByCode for showCase
      wreck.get.mockResolvedValueOnce({
        payload: mockWorkflow
      })

      const request = mockRequest({ params: { id: 'case123' } })
      const h = mockResponseToolkit()

      await casesController.updateStage(request, h)

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
        stages: [
          {
            id: 'stage1',
            title: 'Stage 1 Title',
            taskGroups: []
          }
        ]
      }

      wreck.get.mockResolvedValueOnce({
        payload: caseWithoutStages
      })

      wreck.get.mockResolvedValueOnce({
        payload: mockWorkflow
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

      wreck.get.mockResolvedValueOnce({
        payload: caseWithMismatchedStage
      })

      wreck.get.mockResolvedValueOnce({
        payload: mockWorkflow
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

      wreck.get.mockResolvedValueOnce({
        payload: mockCase
      })

      wreck.get.mockResolvedValueOnce({
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

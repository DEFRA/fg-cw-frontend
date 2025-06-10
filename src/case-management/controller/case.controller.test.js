import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { caseController } from './case.controller.js'

// Mock dependencies
const mockFindAllCasesUseCase = vi.hoisted(() => vi.fn())
const mockCreateCaseListViewModel = vi.hoisted(() => vi.fn())

vi.mock('../use-cases/find-all-cases.use-case.js', () => ({
  findAllCasesUseCase: mockFindAllCasesUseCase
}))

vi.mock('../view-model/case-list.model.js', () => ({
  createCaseListViewModel: mockCreateCaseListViewModel
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

describe('Case Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('listCases', () => {
    test('returns case list view with processed data when use case succeeds', async () => {
      const mockCases = [
        {
          _id: 'case-1',
          clientRef: 'client-ref-1',
          code: 'case-code-1',
          workflowCode: 'workflow-1',
          currentStage: 'stage-1',
          stages: ['stage-1', 'stage-2'],
          createdAt: '2021-01-01T00:00:00.000Z',
          submittedAt: '2021-01-15T10:30:00.000Z',
          status: 'In Progress',
          assignedUser: 'user-1'
        },
        {
          _id: 'case-2',
          clientRef: 'client-ref-2',
          code: 'case-code-2',
          workflowCode: 'workflow-2',
          currentStage: 'stage-2',
          stages: ['stage-1', 'stage-2'],
          createdAt: '2021-02-01T00:00:00.000Z',
          submittedAt: '2021-02-15T10:30:00.000Z',
          status: 'Completed',
          assignedUser: 'user-2'
        }
      ]

      const mockViewModel = {
        pageTitle: 'Cases',
        heading: 'Case Management',
        cases: mockCases.map((c) => ({
          id: c._id,
          clientRef: c.clientRef,
          status: c.status,
          submittedAt: c.submittedAt || 'Not submitted',
          assignedUser: c.assignedUser || 'Unassigned'
        }))
      }

      mockFindAllCasesUseCase.mockResolvedValueOnce(mockCases)
      mockCreateCaseListViewModel.mockReturnValueOnce(mockViewModel)

      const request = mockRequest()
      const h = mockResponseToolkit()

      const result = await caseController.listCases(request, h)

      expect(mockFindAllCasesUseCase).toHaveBeenCalledOnce()
      expect(mockCreateCaseListViewModel).toHaveBeenCalledWith(mockCases)
      expect(h.view).toHaveBeenCalledWith('pages/case-list', mockViewModel)
      expect(result).toBe(h)
    })

    test('returns case list view with empty data when no cases exist', async () => {
      const mockCases = []
      const mockViewModel = {
        pageTitle: 'Cases',
        heading: 'Case Management',
        cases: []
      }

      mockFindAllCasesUseCase.mockResolvedValueOnce(mockCases)
      mockCreateCaseListViewModel.mockReturnValueOnce(mockViewModel)

      const request = mockRequest()
      const h = mockResponseToolkit()

      const result = await caseController.listCases(request, h)

      expect(mockFindAllCasesUseCase).toHaveBeenCalledOnce()
      expect(mockCreateCaseListViewModel).toHaveBeenCalledWith(mockCases)
      expect(h.view).toHaveBeenCalledWith('pages/case-list', mockViewModel)
      expect(result).toBe(h)
    })

    test('handles single case in the list', async () => {
      const mockCases = [
        {
          _id: 'case-single',
          clientRef: 'client-ref-single',
          code: 'case-code-single',
          workflowCode: 'workflow-single',
          currentStage: 'stage-1',
          stages: ['stage-1'],
          createdAt: '2021-01-01T00:00:00.000Z',
          submittedAt: '2021-01-15T10:30:00.000Z',
          status: 'Active',
          assignedUser: 'user-single'
        }
      ]

      const mockViewModel = {
        pageTitle: 'Cases',
        heading: 'Case Management',
        cases: [
          {
            id: 'case-single',
            clientRef: 'client-ref-single',
            status: 'Active',
            submittedAt: '15/01/2021',
            assignedUser: 'user-single'
          }
        ]
      }

      mockFindAllCasesUseCase.mockResolvedValueOnce(mockCases)
      mockCreateCaseListViewModel.mockReturnValueOnce(mockViewModel)

      const request = mockRequest()
      const h = mockResponseToolkit()

      const result = await caseController.listCases(request, h)

      expect(mockFindAllCasesUseCase).toHaveBeenCalledOnce()
      expect(mockCreateCaseListViewModel).toHaveBeenCalledWith(mockCases)
      expect(h.view).toHaveBeenCalledWith('pages/case-list', mockViewModel)
      expect(result).toBe(h)
    })

    test('propagates error when use case throws', async () => {
      const error = new Error('Use case failed')
      mockFindAllCasesUseCase.mockRejectedValueOnce(error)

      const request = mockRequest()
      const h = mockResponseToolkit()

      await expect(caseController.listCases(request, h)).rejects.toThrow(
        'Use case failed'
      )
      expect(mockFindAllCasesUseCase).toHaveBeenCalledOnce()
      expect(mockCreateCaseListViewModel).not.toHaveBeenCalled()
      expect(h.view).not.toHaveBeenCalled()
    })

    test('propagates error when view model creation throws', async () => {
      const mockCases = [
        {
          _id: 'case-1',
          clientRef: 'client-ref-1',
          status: 'Active'
        }
      ]

      const error = new Error('View model creation failed')
      mockFindAllCasesUseCase.mockResolvedValueOnce(mockCases)
      mockCreateCaseListViewModel.mockImplementationOnce(() => {
        throw error
      })

      const request = mockRequest()
      const h = mockResponseToolkit()

      await expect(caseController.listCases(request, h)).rejects.toThrow(
        'View model creation failed'
      )
      expect(mockFindAllCasesUseCase).toHaveBeenCalledOnce()
      expect(mockCreateCaseListViewModel).toHaveBeenCalledWith(mockCases)
      expect(h.view).not.toHaveBeenCalled()
    })

    test('calls dependencies in correct order', async () => {
      const mockCases = []
      const mockViewModel = { pageTitle: 'Cases', cases: [] }

      mockFindAllCasesUseCase.mockResolvedValueOnce(mockCases)
      mockCreateCaseListViewModel.mockReturnValueOnce(mockViewModel)

      const request = mockRequest()
      const h = mockResponseToolkit()

      await caseController.listCases(request, h)

      // Verify call order
      expect(mockFindAllCasesUseCase).toHaveBeenCalledBefore(
        mockCreateCaseListViewModel
      )
      expect(mockCreateCaseListViewModel).toHaveBeenCalledBefore(h.view)
    })

    test('passes correct parameters to each dependency', async () => {
      const mockCases = [{ _id: 'test-case' }]
      const mockViewModel = { pageTitle: 'Test Cases' }

      mockFindAllCasesUseCase.mockResolvedValueOnce(mockCases)
      mockCreateCaseListViewModel.mockReturnValueOnce(mockViewModel)

      const request = mockRequest()
      const h = mockResponseToolkit()

      await caseController.listCases(request, h)

      // Verify parameters
      expect(mockFindAllCasesUseCase).toHaveBeenCalledWith()
      expect(mockCreateCaseListViewModel).toHaveBeenCalledWith(mockCases)
      expect(h.view).toHaveBeenCalledWith('pages/case-list', mockViewModel)
    })
  })
})

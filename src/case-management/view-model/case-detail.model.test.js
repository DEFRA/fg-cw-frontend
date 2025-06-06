import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { createCaseDetailViewModel } from './case-detail.model.js'

describe('createCaseDetailViewModel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  test('creates view model with all case properties', () => {
    const mockCase = {
      _id: 'case-123',
      clientRef: 'CLIENT-REF-001',
      code: 'CASE-CODE-001',
      stages: ['stage-1', 'stage-2', 'stage-3'],
      currentStage: 'stage-2',
      getFormattedSubmittedDate: vi.fn().mockReturnValue('15/01/2021'),
      getStatusDisplay: vi.fn().mockReturnValue('In Progress'),
      getAssignedUserDisplay: vi.fn().mockReturnValue('john doe')
    }

    const result = createCaseDetailViewModel(mockCase)

    expect(result).toEqual({
      pageTitle: 'Case CLIENT-REF-001',
      heading: 'Case CLIENT-REF-001',
      breadcrumbs: [
        { text: 'Cases', href: '/cases' },
        { text: 'CLIENT-REF-001' }
      ],
      data: {
        case: {
          _id: 'case-123',
          clientRef: 'CLIENT-REF-001',
          code: 'CASE-CODE-001',
          submittedDate: '15/01/2021',
          status: 'In Progress',
          assignedUser: 'john doe',
          stages: ['stage-1', 'stage-2', 'stage-3'],
          currentStage: 'stage-2'
        }
      }
    })

    expect(mockCase.getFormattedSubmittedDate).toHaveBeenCalledOnce()
    expect(mockCase.getStatusDisplay).toHaveBeenCalledOnce()
    expect(mockCase.getAssignedUserDisplay).toHaveBeenCalledOnce()
  })

  test('creates view model with minimal case properties', () => {
    const mockCase = {
      _id: 'case-minimal',
      clientRef: 'MIN-001',
      code: 'MIN-CODE',
      stages: [],
      currentStage: null,
      getFormattedSubmittedDate: vi.fn().mockReturnValue('Not submitted'),
      getStatusDisplay: vi.fn().mockReturnValue('In Progress'),
      getAssignedUserDisplay: vi.fn().mockReturnValue('Unassigned')
    }

    const result = createCaseDetailViewModel(mockCase)

    expect(result).toEqual({
      pageTitle: 'Case MIN-001',
      heading: 'Case MIN-001',
      breadcrumbs: [{ text: 'Cases', href: '/cases' }, { text: 'MIN-001' }],
      data: {
        case: {
          _id: 'case-minimal',
          clientRef: 'MIN-001',
          code: 'MIN-CODE',
          submittedDate: 'Not submitted',
          status: 'In Progress',
          assignedUser: 'Unassigned',
          stages: [],
          currentStage: null
        }
      }
    })
  })

  test('creates view model with completed case', () => {
    const mockCase = {
      _id: 'case-completed',
      clientRef: 'COMP-001',
      code: 'COMP-CODE',
      stages: ['initial', 'review', 'completed'],
      currentStage: 'completed',
      getFormattedSubmittedDate: vi.fn().mockReturnValue('20/03/2021'),
      getStatusDisplay: vi.fn().mockReturnValue('Completed'),
      getAssignedUserDisplay: vi.fn().mockReturnValue('jane smith')
    }

    const result = createCaseDetailViewModel(mockCase)

    expect(result.data.case.status).toBe('Completed')
    expect(result.data.case.assignedUser).toBe('jane smith')
    expect(result.data.case.submittedDate).toBe('20/03/2021')
    expect(result.data.case.currentStage).toBe('completed')
  })

  test('creates correct breadcrumbs structure', () => {
    const mockCase = {
      _id: 'case-breadcrumb',
      clientRef: 'BREAD-001',
      code: 'BREAD-CODE',
      stages: [],
      currentStage: null,
      getFormattedSubmittedDate: vi.fn().mockReturnValue('Not submitted'),
      getStatusDisplay: vi.fn().mockReturnValue('In Progress'),
      getAssignedUserDisplay: vi.fn().mockReturnValue('Unassigned')
    }

    const result = createCaseDetailViewModel(mockCase)

    expect(result.breadcrumbs).toHaveLength(2)
    expect(result.breadcrumbs[0]).toEqual({ text: 'Cases', href: '/cases' })
    expect(result.breadcrumbs[1]).toEqual({ text: 'BREAD-001' })
  })

  test('creates consistent page title and heading', () => {
    const mockCase = {
      _id: 'case-title',
      clientRef: 'TITLE-001',
      code: 'TITLE-CODE',
      stages: [],
      currentStage: null,
      getFormattedSubmittedDate: vi.fn().mockReturnValue('Not submitted'),
      getStatusDisplay: vi.fn().mockReturnValue('In Progress'),
      getAssignedUserDisplay: vi.fn().mockReturnValue('Unassigned')
    }

    const result = createCaseDetailViewModel(mockCase)

    expect(result.pageTitle).toBe('Case TITLE-001')
    expect(result.heading).toBe('Case TITLE-001')
    expect(result.pageTitle).toBe(result.heading)
  })

  test('calls all case methods exactly once', () => {
    const mockCase = {
      _id: 'case-methods',
      clientRef: 'METHOD-001',
      code: 'METHOD-CODE',
      stages: ['stage-1'],
      currentStage: 'stage-1',
      getFormattedSubmittedDate: vi.fn().mockReturnValue('01/01/2021'),
      getStatusDisplay: vi.fn().mockReturnValue('Active'),
      getAssignedUserDisplay: vi.fn().mockReturnValue('test user')
    }

    createCaseDetailViewModel(mockCase)

    expect(mockCase.getFormattedSubmittedDate).toHaveBeenCalledTimes(1)
    expect(mockCase.getStatusDisplay).toHaveBeenCalledTimes(1)
    expect(mockCase.getAssignedUserDisplay).toHaveBeenCalledTimes(1)
  })
})

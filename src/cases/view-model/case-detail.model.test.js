import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createCaseDetailViewModel } from './case-detail.model.js'
import { getFormattedGBDate } from '../../common/helpers/date-helpers.js'

// Mock the date helper
vi.mock('../../common/helpers/date-helpers.js', () => ({
  getFormattedGBDate: vi.fn()
}))

describe('createCaseDetailViewModel', () => {
  it('creates view model with all case properties', () => {
    const mockCase = {
      _id: 'case-123',
      clientRef: 'CLIENT-REF-001',
      code: 'CASE-CODE-001',
      submittedAt: '2021-01-15T00:00:00.000Z',
      stages: ['stage-1', 'stage-2', 'stage-3'],
      currentStage: 'stage-2',
      status: 'In Progress',
      assignedUser: 'john doe'
    }

    getFormattedGBDate.mockReturnValue('15/01/2021')

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
          submittedAt: '15/01/2021',
          status: 'In Progress',
          assignedUser: 'john doe',
          stages: ['stage-1', 'stage-2', 'stage-3'],
          currentStage: 'stage-2'
        }
      }
    })

    expect(getFormattedGBDate).toHaveBeenCalledWith('2021-01-15T00:00:00.000Z')
    expect(getFormattedGBDate).toHaveBeenCalledTimes(1)
  })

  it('creates view model with minimal case properties', () => {
    const mockCase = {
      _id: 'case-minimal',
      clientRef: 'MIN-001',
      code: 'MIN-CODE',
      submittedAt: null,
      stages: [],
      currentStage: null,
      status: 'In Progress',
      assignedUser: 'Unassigned'
    }

    getFormattedGBDate.mockReturnValue('Not submitted')

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
          submittedAt: 'Not submitted',
          status: 'In Progress',
          assignedUser: 'Unassigned',
          stages: [],
          currentStage: null
        }
      }
    })

    expect(getFormattedGBDate).toHaveBeenCalledWith(null)
  })

  it('creates view model with completed case', () => {
    const mockCase = {
      _id: 'case-completed',
      clientRef: 'COMP-001',
      code: 'COMP-CODE',
      submittedAt: '2021-03-20T00:00:00.000Z',
      stages: ['initial', 'review', 'completed'],
      currentStage: 'completed',
      status: 'Completed',
      assignedUser: 'jane smith'
    }

    getFormattedGBDate.mockReturnValue('20/03/2021')

    const result = createCaseDetailViewModel(mockCase)

    expect(result.data.case.status).toBe('Completed')
    expect(result.data.case.assignedUser).toBe('jane smith')
    expect(result.data.case.submittedAt).toBe('20/03/2021')
    expect(result.data.case.currentStage).toBe('completed')
    expect(getFormattedGBDate).toHaveBeenCalledWith('2021-03-20T00:00:00.000Z')
  })

  it('creates correct breadcrumbs structure', () => {
    const mockCase = {
      _id: 'case-breadcrumb',
      clientRef: 'BREAD-001',
      code: 'BREAD-CODE',
      submittedAt: null,
      stages: [],
      currentStage: null,
      status: 'In Progress',
      assignedUser: 'Unassigned'
    }

    getFormattedGBDate.mockReturnValue('Not submitted')

    const result = createCaseDetailViewModel(mockCase)

    expect(result.breadcrumbs).toHaveLength(2)
    expect(result.breadcrumbs[0]).toEqual({ text: 'Cases', href: '/cases' })
    expect(result.breadcrumbs[1]).toEqual({ text: 'BREAD-001' })
  })

  it('creates consistent page title and heading', () => {
    const mockCase = {
      _id: 'case-title',
      clientRef: 'TITLE-001',
      code: 'TITLE-CODE',
      submittedAt: null,
      stages: [],
      currentStage: null,
      status: 'In Progress',
      assignedUser: 'Unassigned'
    }

    getFormattedGBDate.mockReturnValue('Not submitted')

    const result = createCaseDetailViewModel(mockCase)

    expect(result.pageTitle).toBe('Case TITLE-001')
    expect(result.heading).toBe('Case TITLE-001')
    expect(result.pageTitle).toBe(result.heading)
  })

  it('calls date helper function exactly once', () => {
    const mockCase = {
      _id: 'case-methods',
      clientRef: 'METHOD-001',
      code: 'METHOD-CODE',
      submittedAt: '2021-01-01T00:00:00.000Z',
      stages: ['stage-1'],
      currentStage: 'stage-1',
      status: 'Active',
      assignedUser: 'test user'
    }

    getFormattedGBDate.mockReturnValue('01/01/2021')

    createCaseDetailViewModel(mockCase)

    expect(getFormattedGBDate).toHaveBeenCalledTimes(1)
    expect(getFormattedGBDate).toHaveBeenCalledWith('2021-01-01T00:00:00.000Z')
  })
})

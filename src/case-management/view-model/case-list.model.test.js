import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  transformCasesForList,
  createCaseListViewModel
} from './case-list.model.js'

describe('case-list.model', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('transformCasesForList', () => {
    it('transforms multiple cases correctly', () => {
      const mockCases = [
        {
          _id: 'case-1',
          clientRef: 'CLIENT-001',
          code: 'CODE-001',
          getFormattedSubmittedDate: vi.fn().mockReturnValue('15/01/2021'),
          getStatusDisplay: vi.fn().mockReturnValue('In Progress'),
          getAssignedUserDisplay: vi.fn().mockReturnValue('john doe')
        },
        {
          _id: 'case-2',
          clientRef: 'CLIENT-002',
          code: 'CODE-002',
          getFormattedSubmittedDate: vi.fn().mockReturnValue('20/02/2021'),
          getStatusDisplay: vi.fn().mockReturnValue('Completed'),
          getAssignedUserDisplay: vi.fn().mockReturnValue('jane smith')
        }
      ]

      const result = transformCasesForList(mockCases)

      expect(result).toEqual({
        allCases: [
          {
            _id: 'case-1',
            clientRef: 'CLIENT-001',
            code: 'CODE-001',
            submittedDate: '15/01/2021',
            status: 'In Progress',
            assignedUser: 'john doe',
            link: '/case/case-1'
          },
          {
            _id: 'case-2',
            clientRef: 'CLIENT-002',
            code: 'CODE-002',
            submittedDate: '20/02/2021',
            status: 'Completed',
            assignedUser: 'jane smith',
            link: '/case/case-2'
          }
        ]
      })

      // Verify all methods were called
      mockCases.forEach((mockCase) => {
        expect(mockCase.getFormattedSubmittedDate).toHaveBeenCalledOnce()
        expect(mockCase.getStatusDisplay).toHaveBeenCalledOnce()
        expect(mockCase.getAssignedUserDisplay).toHaveBeenCalledOnce()
      })
    })

    it('transforms empty cases array', () => {
      const mockCases = []

      const result = transformCasesForList(mockCases)

      expect(result).toEqual({
        allCases: []
      })
    })

    it('transforms single case correctly', () => {
      const mockCases = [
        {
          _id: 'case-single',
          clientRef: 'SINGLE-001',
          code: 'SINGLE-CODE',
          getFormattedSubmittedDate: vi.fn().mockReturnValue('Not submitted'),
          getStatusDisplay: vi.fn().mockReturnValue('Draft'),
          getAssignedUserDisplay: vi.fn().mockReturnValue('Unassigned')
        }
      ]

      const result = transformCasesForList(mockCases)

      expect(result.allCases).toHaveLength(1)
      expect(result.allCases[0]).toEqual({
        _id: 'case-single',
        clientRef: 'SINGLE-001',
        code: 'SINGLE-CODE',
        submittedDate: 'Not submitted',
        status: 'Draft',
        assignedUser: 'Unassigned',
        link: '/case/case-single'
      })
    })

    it('generates correct case links', () => {
      const mockCases = [
        {
          _id: 'case-link-1',
          clientRef: 'LINK-001',
          code: 'LINK-CODE-1',
          getFormattedSubmittedDate: vi.fn().mockReturnValue('01/01/2021'),
          getStatusDisplay: vi.fn().mockReturnValue('Active'),
          getAssignedUserDisplay: vi.fn().mockReturnValue('user1')
        },
        {
          _id: 'case-link-2',
          clientRef: 'LINK-002',
          code: 'LINK-CODE-2',
          getFormattedSubmittedDate: vi.fn().mockReturnValue('02/01/2021'),
          getStatusDisplay: vi.fn().mockReturnValue('Active'),
          getAssignedUserDisplay: vi.fn().mockReturnValue('user2')
        }
      ]

      const result = transformCasesForList(mockCases)

      expect(result.allCases[0].link).toBe('/case/case-link-1')
      expect(result.allCases[1].link).toBe('/case/case-link-2')
    })
  })

  describe('createCaseListViewModel', () => {
    it('creates complete view model with cases', () => {
      const mockCases = [
        {
          _id: 'case-vm-1',
          clientRef: 'VM-001',
          code: 'VM-CODE-1',
          getFormattedSubmittedDate: vi.fn().mockReturnValue('10/03/2021'),
          getStatusDisplay: vi.fn().mockReturnValue('Review'),
          getAssignedUserDisplay: vi.fn().mockReturnValue('reviewer1')
        },
        {
          _id: 'case-vm-2',
          clientRef: 'VM-002',
          code: 'VM-CODE-2',
          getFormattedSubmittedDate: vi.fn().mockReturnValue('15/03/2021'),
          getStatusDisplay: vi.fn().mockReturnValue('Approved'),
          getAssignedUserDisplay: vi.fn().mockReturnValue('approver1')
        }
      ]

      const result = createCaseListViewModel(mockCases)

      expect(result).toEqual({
        pageTitle: 'Cases',
        heading: 'Cases',
        breadcrumbs: [],
        data: {
          allCases: [
            {
              _id: 'case-vm-1',
              clientRef: 'VM-001',
              code: 'VM-CODE-1',
              submittedDate: '10/03/2021',
              status: 'Review',
              assignedUser: 'reviewer1',
              link: '/case/case-vm-1'
            },
            {
              _id: 'case-vm-2',
              clientRef: 'VM-002',
              code: 'VM-CODE-2',
              submittedDate: '15/03/2021',
              status: 'Approved',
              assignedUser: 'approver1',
              link: '/case/case-vm-2'
            }
          ]
        }
      })
    })

    it('creates view model with empty cases', () => {
      const mockCases = []

      const result = createCaseListViewModel(mockCases)

      expect(result).toEqual({
        pageTitle: 'Cases',
        heading: 'Cases',
        breadcrumbs: [],
        data: {
          allCases: []
        }
      })
    })

    it('creates view model with single case', () => {
      const mockCases = [
        {
          _id: 'case-single-vm',
          clientRef: 'SINGLE-VM-001',
          code: 'SINGLE-VM-CODE',
          getFormattedSubmittedDate: vi.fn().mockReturnValue('25/04/2021'),
          getStatusDisplay: vi.fn().mockReturnValue('Pending'),
          getAssignedUserDisplay: vi.fn().mockReturnValue('pending user')
        }
      ]

      const result = createCaseListViewModel(mockCases)

      expect(result.data.allCases).toHaveLength(1)
      expect(result.data.allCases[0].clientRef).toBe('SINGLE-VM-001')
      expect(result.pageTitle).toBe('Cases')
      expect(result.heading).toBe('Cases')
    })

    it('has consistent page title and heading', () => {
      const mockCases = []

      const result = createCaseListViewModel(mockCases)

      expect(result.pageTitle).toBe('Cases')
      expect(result.heading).toBe('Cases')
      expect(result.pageTitle).toBe(result.heading)
    })

    it('has empty breadcrumbs array', () => {
      const mockCases = []

      const result = createCaseListViewModel(mockCases)

      expect(result.breadcrumbs).toEqual([])
      expect(Array.isArray(result.breadcrumbs)).toBe(true)
    })

    it('calls transformCasesForList internally', () => {
      const mockCases = [
        {
          _id: 'case-transform',
          clientRef: 'TRANSFORM-001',
          code: 'TRANSFORM-CODE',
          getFormattedSubmittedDate: vi.fn().mockReturnValue('01/05/2021'),
          getStatusDisplay: vi.fn().mockReturnValue('Processing'),
          getAssignedUserDisplay: vi.fn().mockReturnValue('processor')
        }
      ]

      const result = createCaseListViewModel(mockCases)

      // Verify the transformation happened by checking the structure
      expect(result.data).toHaveProperty('allCases')
      expect(result.data.allCases[0]).toHaveProperty('link')
      expect(result.data.allCases[0].link).toBe('/case/case-transform')
    })
  })
})

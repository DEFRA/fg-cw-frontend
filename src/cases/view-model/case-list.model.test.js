import { describe, it, expect, vi } from 'vitest'
import {
  transformCasesForList,
  createCaseListViewModel
} from './case-list.model.js'
import { getFormattedGBDate } from '../../common/helpers/date-helpers.js'

vi.mock('../../common/helpers/date-helpers.js', () => ({
  getFormattedGBDate: vi.fn()
}))

describe('case-list.model', () => {
  describe('transformCasesForList', () => {
    it('transforms multiple cases correctly', () => {
      const mockCases = [
        {
          _id: 'case-1',
          payload: {
            clientRef: 'CLIENT-001',
            code: 'CODE-001',
            submittedAt: '2021-01-15T00:00:00.000Z'
          },
          status: 'In Progress',
          assignedUser: 'john doe'
        },
        {
          _id: 'case-2',
          payload: {
            clientRef: 'CLIENT-002',
            code: 'CODE-002',
            submittedAt: '2021-02-20T00:00:00.000Z'
          },
          status: 'Completed',
          assignedUser: 'jane smith'
        }
      ]

      getFormattedGBDate
        .mockReturnValueOnce('15/01/2021')
        .mockReturnValueOnce('20/02/2021')

      const result = transformCasesForList(mockCases)

      expect(result).toEqual({
        allCases: [
          {
            clientRef: 'CLIENT-001',
            code: 'CODE-001',
            submittedAt: '15/01/2021',
            status: 'In Progress',
            assignedUser: 'john doe',
            link: '/case/case-1'
          },
          {
            clientRef: 'CLIENT-002',
            code: 'CODE-002',
            submittedAt: '20/02/2021',
            status: 'Completed',
            assignedUser: 'jane smith',
            link: '/case/case-2'
          }
        ]
      })

      expect(getFormattedGBDate).toHaveBeenCalledWith(
        '2021-01-15T00:00:00.000Z'
      )
      expect(getFormattedGBDate).toHaveBeenCalledWith(
        '2021-02-20T00:00:00.000Z'
      )
      expect(getFormattedGBDate).toHaveBeenCalledTimes(2)
    })

    it('transforms empty cases array', () => {
      const mockCases = []

      const result = transformCasesForList(mockCases)

      expect(result).toEqual({
        allCases: []
      })

      expect(getFormattedGBDate).not.toHaveBeenCalled()
    })

    it('transforms single case correctly', () => {
      const mockCases = [
        {
          _id: 'case-single',
          payload: {
            clientRef: 'SINGLE-001',
            code: 'SINGLE-CODE',
            submittedAt: null
          },
          status: 'Draft',
          assignedUser: 'Unassigned'
        }
      ]

      getFormattedGBDate.mockReturnValue('Not submitted')

      const result = transformCasesForList(mockCases)

      expect(result.allCases).toHaveLength(1)
      expect(result.allCases[0]).toEqual({
        clientRef: 'SINGLE-001',
        code: 'SINGLE-CODE',
        submittedAt: 'Not submitted',
        status: 'Draft',
        assignedUser: 'Unassigned',
        link: '/case/case-single'
      })

      expect(getFormattedGBDate).toHaveBeenCalledWith(null)
    })

    it('generates correct case links', () => {
      const mockCases = [
        {
          _id: 'case-link-1',
          payload: {
            clientRef: 'LINK-001',
            code: 'LINK-CODE-1',
            submittedAt: '2021-01-01T00:00:00.000Z'
          },
          status: 'Active',
          assignedUser: 'user1'
        },
        {
          _id: 'case-link-2',
          payload: {
            clientRef: 'LINK-002',
            code: 'LINK-CODE-2',
            submittedAt: '2021-01-02T00:00:00.000Z'
          },
          status: 'Active',
          assignedUser: 'user2'
        }
      ]

      getFormattedGBDate
        .mockReturnValueOnce('01/01/2021')
        .mockReturnValueOnce('02/01/2021')

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
          payload: {
            clientRef: 'VM-001',
            code: 'VM-CODE-1',
            submittedAt: '2021-03-10T00:00:00.000Z'
          },
          status: 'Review',
          assignedUser: 'reviewer1'
        },
        {
          _id: 'case-vm-2',
          payload: {
            clientRef: 'VM-002',
            code: 'VM-CODE-2',
            submittedAt: '2021-03-15T00:00:00.000Z'
          },
          status: 'Approved',
          assignedUser: 'approver1'
        }
      ]

      getFormattedGBDate
        .mockReturnValueOnce('10/03/2021')
        .mockReturnValueOnce('15/03/2021')

      const result = createCaseListViewModel(mockCases)

      expect(result).toEqual({
        pageTitle: 'Cases',
        heading: 'Cases',
        breadcrumbs: [],
        data: {
          allCases: [
            {
              clientRef: 'VM-001',
              code: 'VM-CODE-1',
              submittedAt: '10/03/2021',
              status: 'Review',
              assignedUser: 'reviewer1',
              link: '/case/case-vm-1'
            },
            {
              clientRef: 'VM-002',
              code: 'VM-CODE-2',
              submittedAt: '15/03/2021',
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

      expect(getFormattedGBDate).not.toHaveBeenCalled()
    })

    it('creates view model with single case', () => {
      const mockCases = [
        {
          _id: 'case-single-vm',
          payload: {
            clientRef: 'SINGLE-VM-001',
            code: 'SINGLE-VM-CODE',
            submittedAt: '2021-04-25T00:00:00.000Z'
          },
          status: 'Pending',
          assignedUser: 'pending user'
        }
      ]

      getFormattedGBDate.mockReturnValue('25/04/2021')

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
          payload: {
            clientRef: 'TRANSFORM-001',
            code: 'TRANSFORM-CODE',
            submittedAt: '2021-05-01T00:00:00.000Z'
          },
          status: 'Processing',
          assignedUser: 'processor'
        }
      ]

      getFormattedGBDate.mockReturnValue('01/05/2021')

      const result = createCaseListViewModel(mockCases)

      // Verify the transformation happened by checking the structure
      expect(result.data).toHaveProperty('allCases')
      expect(result.data.allCases[0]).toHaveProperty('link')
      expect(result.data.allCases[0].link).toBe('/case/case-transform')
    })
  })
})

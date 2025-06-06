import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { findAll, findById, updateStage } from './case.repository.js'
import { Case } from '../models/case.js'
import {
  CaseRepositoryError,
  CaseNotFoundError,
  CaseUpdateError
} from '../errors/case-errors.js'

// Mock the wreck dependency
const mockWreck = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn()
}))

vi.mock('../../server/common/helpers/wreck.js', () => ({
  wreck: mockWreck
}))

describe('Case Repository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('findAll', () => {
    it('returns array of Case instances when API call succeeds', async () => {
      const mockApiResponse = {
        payload: {
          data: [
            {
              _id: 'case-1',
              caseRef: 'client-ref-1',
              payload: {
                code: 'case-code-1'
              },
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
              caseRef: 'client-ref-2',
              workflowCode: 'workflow-2',
              currentStage: 'stage-2',
              createdAt: '2021-02-01T00:00:00.000Z',
              submittedAt: '2021-02-15T10:30:00.000Z',
              status: 'Completed',
              assignedUser: 'user-2'
            }
          ]
        }
      }

      mockWreck.get.mockResolvedValueOnce(mockApiResponse)

      const result = await findAll()

      expect(mockWreck.get).toHaveBeenCalledWith('/cases')
      expect(result).toHaveLength(2)
      expect(result[0]).toBeInstanceOf(Case)
      expect(result[0]).toEqual({
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
      })
      expect(result[1]).toBeInstanceOf(Case)
      expect(result[1]).toEqual({
        _id: 'case-2',
        clientRef: 'client-ref-2',
        code: undefined,
        workflowCode: 'workflow-2',
        currentStage: 'stage-2',
        stages: [],
        createdAt: '2021-02-01T00:00:00.000Z',
        submittedAt: '2021-02-15T10:30:00.000Z',
        status: 'Completed',
        assignedUser: 'user-2'
      })
    })

    it('returns empty array when API returns no data', async () => {
      const mockApiResponse = {
        payload: {
          data: []
        }
      }

      mockWreck.get.mockResolvedValueOnce(mockApiResponse)

      const result = await findAll()

      expect(mockWreck.get).toHaveBeenCalledWith('/cases')
      expect(result).toEqual([])
    })

    it('returns empty array when API returns null data', async () => {
      const mockApiResponse = {
        payload: {
          data: null
        }
      }

      mockWreck.get.mockResolvedValueOnce(mockApiResponse)

      const result = await findAll()

      expect(mockWreck.get).toHaveBeenCalledWith('/cases')
      expect(result).toEqual([])
    })

    it('returns empty array when API returns undefined data', async () => {
      const mockApiResponse = {
        payload: {}
      }

      mockWreck.get.mockResolvedValueOnce(mockApiResponse)

      const result = await findAll()

      expect(mockWreck.get).toHaveBeenCalledWith('/cases')
      expect(result).toEqual([])
    })

    it('throws CaseRepositoryError when API call fails', async () => {
      mockWreck.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(findAll()).rejects.toThrow(CaseRepositoryError)
      await expect(findAll()).rejects.toThrow('Failed to fetch cases')
      expect(mockWreck.get).toHaveBeenCalledWith('/cases')
    })
  })

  describe('findById', () => {
    it('returns Case instance when API call succeeds', async () => {
      const caseId = 'case-123'
      const mockApiResponse = {
        payload: {
          _id: 'case-123',
          caseRef: 'client-ref-123',
          payload: {
            code: 'case-code-123'
          },
          workflowCode: 'workflow-123',
          currentStage: 'stage-1',
          stages: ['stage-1'],
          createdAt: '2021-01-01T00:00:00.000Z',
          submittedAt: '2021-01-15T10:30:00.000Z',
          status: 'Active',
          assignedUser: 'user-123'
        }
      }

      mockWreck.get.mockResolvedValueOnce(mockApiResponse)

      const result = await findById(caseId)

      expect(mockWreck.get).toHaveBeenCalledWith('/cases/case-123')
      expect(result).toBeInstanceOf(Case)
      expect(result).toEqual({
        _id: 'case-123',
        clientRef: 'client-ref-123',
        code: 'case-code-123',
        workflowCode: 'workflow-123',
        currentStage: 'stage-1',
        stages: ['stage-1'],
        createdAt: '2021-01-01T00:00:00.000Z',
        submittedAt: '2021-01-15T10:30:00.000Z',
        status: 'Active',
        assignedUser: 'user-123'
      })
    })

    it('returns null when API returns null payload', async () => {
      const caseId = 'nonexistent-case'
      const mockApiResponse = {
        payload: null
      }

      mockWreck.get.mockResolvedValueOnce(mockApiResponse)

      const result = await findById(caseId)

      expect(mockWreck.get).toHaveBeenCalledWith('/cases/nonexistent-case')
      expect(result).toBeNull()
    })

    it('returns null when API returns undefined payload', async () => {
      const caseId = 'nonexistent-case'
      const mockApiResponse = {}

      mockWreck.get.mockResolvedValueOnce(mockApiResponse)

      const result = await findById(caseId)

      expect(mockWreck.get).toHaveBeenCalledWith('/cases/nonexistent-case')
      expect(result).toBeNull()
    })

    it('throws CaseNotFoundError when API call fails', async () => {
      const caseId = 'case-123'
      mockWreck.get.mockRejectedValueOnce(new Error('Not found'))

      await expect(findById(caseId)).rejects.toThrow(CaseNotFoundError)
      await expect(findById(caseId)).rejects.toThrow(
        'Failed to fetch case by ID'
      )
      expect(mockWreck.get).toHaveBeenCalledWith('/cases/case-123')
    })
  })

  describe('updateStage', () => {
    it('returns updated Case instance when API call succeeds', async () => {
      const caseId = 'case-123'
      const mockApiResponse = {
        payload: {
          _id: 'case-123',
          caseRef: 'client-ref-123',
          payload: {
            code: 'case-code-123'
          },
          workflowCode: 'workflow-123',
          currentStage: 'stage-2',
          stages: ['stage-1', 'stage-2'],
          createdAt: '2021-01-01T00:00:00.000Z',
          submittedAt: '2021-01-15T10:30:00.000Z',
          status: 'Updated',
          assignedUser: 'user-123'
        }
      }

      mockWreck.post.mockResolvedValueOnce(mockApiResponse)

      const result = await updateStage(caseId)

      expect(mockWreck.post).toHaveBeenCalledWith('/cases/case-123/stage')
      expect(result).toBeInstanceOf(Case)
      expect(result).toEqual({
        _id: 'case-123',
        clientRef: 'client-ref-123',
        code: 'case-code-123',
        workflowCode: 'workflow-123',
        currentStage: 'stage-2',
        stages: ['stage-1', 'stage-2'],
        createdAt: '2021-01-01T00:00:00.000Z',
        submittedAt: '2021-01-15T10:30:00.000Z',
        status: 'Updated',
        assignedUser: 'user-123'
      })
    })

    it('returns null when API returns null payload', async () => {
      const caseId = 'case-123'
      const mockApiResponse = {
        payload: null
      }

      mockWreck.post.mockResolvedValueOnce(mockApiResponse)

      const result = await updateStage(caseId)

      expect(mockWreck.post).toHaveBeenCalledWith('/cases/case-123/stage')
      expect(result).toBeNull()
    })

    it('returns null when API returns undefined payload', async () => {
      const caseId = 'case-123'
      const mockApiResponse = {}

      mockWreck.post.mockResolvedValueOnce(mockApiResponse)

      const result = await updateStage(caseId)

      expect(mockWreck.post).toHaveBeenCalledWith('/cases/case-123/stage')
      expect(result).toBeNull()
    })

    it('throws CaseUpdateError when API call fails', async () => {
      const caseId = 'case-123'
      mockWreck.post.mockRejectedValueOnce(new Error('Update failed'))

      await expect(updateStage(caseId)).rejects.toThrow(CaseUpdateError)
      await expect(updateStage(caseId)).rejects.toThrow(
        'Failed to update case stage'
      )
      expect(mockWreck.post).toHaveBeenCalledWith('/cases/case-123/stage')
    })
  })

  describe('toCase transformation', () => {
    it('handles data with payload structure', async () => {
      const mockApiResponse = {
        payload: {
          data: [
            {
              _id: 'case-1',
              caseRef: 'client-ref-1',
              payload: {
                code: 'case-code-1'
              },
              workflowCode: 'workflow-1',
              currentStage: 'stage-1',
              stages: ['stage-1'],
              createdAt: '2021-01-01T00:00:00.000Z',
              submittedAt: '2021-01-15T10:30:00.000Z',
              status: 'Active',
              assignedUser: 'user-1'
            }
          ]
        }
      }

      mockWreck.get.mockResolvedValueOnce(mockApiResponse)

      const result = await findAll()

      expect(result[0].clientRef).toBe('client-ref-1')
      expect(result[0].code).toBe('case-code-1')
      expect(result[0].createdAt).toBe('2021-01-01T00:00:00.000Z')
      expect(result[0].submittedAt).toBe('2021-01-15T10:30:00.000Z')
    })

    it('handles data with direct structure', async () => {
      const mockApiResponse = {
        payload: {
          data: [
            {
              _id: 'case-2',
              caseRef: 'client-ref-2',
              workflowCode: 'workflow-2',
              currentStage: 'stage-2',
              createdAt: '2021-02-01T00:00:00.000Z',
              submittedAt: '2021-02-15T10:30:00.000Z',
              status: 'Completed',
              assignedUser: 'user-2'
            }
          ]
        }
      }

      mockWreck.get.mockResolvedValueOnce(mockApiResponse)

      const result = await findAll()

      expect(result[0].clientRef).toBe('client-ref-2')
      expect(result[0].code).toBeUndefined()
      expect(result[0].createdAt).toBe('2021-02-01T00:00:00.000Z')
      expect(result[0].submittedAt).toBe('2021-02-15T10:30:00.000Z')
    })

    it('handles missing stages array', async () => {
      const mockApiResponse = {
        payload: {
          data: [
            {
              _id: 'case-3',
              caseRef: 'client-ref-3',
              workflowCode: 'workflow-3',
              currentStage: 'stage-1',
              status: 'Active',
              assignedUser: 'user-3'
            }
          ]
        }
      }

      mockWreck.get.mockResolvedValueOnce(mockApiResponse)

      const result = await findAll()

      expect(result[0].stages).toEqual([])
    })
  })
})

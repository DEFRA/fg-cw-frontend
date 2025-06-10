import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { findAllCasesUseCase } from './find-all-cases.use-case.js'

// Mock dependencies
const mockFindAll = vi.hoisted(() => vi.fn())

vi.mock('../repositories/case.repository.js', () => ({
  findAll: mockFindAll
}))

describe('findAllCasesUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  test('returns all cases when repository succeeds', async () => {
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
        assignedUser: 'john doe'
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
        assignedUser: 'jane smith'
      }
    ]

    mockFindAll.mockResolvedValueOnce(mockCases)

    const result = await findAllCasesUseCase()

    expect(mockFindAll).toHaveBeenCalledOnce()
    expect(mockFindAll).toHaveBeenCalledWith()
    expect(result).toEqual(mockCases)
  })

  test('returns empty array when no cases exist', async () => {
    const mockCases = []

    mockFindAll.mockResolvedValueOnce(mockCases)

    const result = await findAllCasesUseCase()

    expect(mockFindAll).toHaveBeenCalledOnce()
    expect(mockFindAll).toHaveBeenCalledWith()
    expect(result).toEqual([])
  })

  test('returns single case when only one exists', async () => {
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

    mockFindAll.mockResolvedValueOnce(mockCases)

    const result = await findAllCasesUseCase()

    expect(mockFindAll).toHaveBeenCalledOnce()
    expect(result).toEqual(mockCases)
    expect(result).toHaveLength(1)
  })

  test('propagates error when repository throws', async () => {
    const error = new Error('Repository failed')
    mockFindAll.mockRejectedValueOnce(error)

    await expect(findAllCasesUseCase()).rejects.toThrow('Repository failed')
    expect(mockFindAll).toHaveBeenCalledOnce()
  })

  test('calls repository without parameters', async () => {
    const mockCases = []
    mockFindAll.mockResolvedValueOnce(mockCases)

    await findAllCasesUseCase()

    expect(mockFindAll).toHaveBeenCalledWith()
  })
})

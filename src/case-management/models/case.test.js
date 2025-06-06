import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Case } from './case.js'

describe('Case', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2021, 1, 1, 13))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('creates a Case model with all properties', () => {
    const caseData = {
      _id: 'case-123',
      clientRef: 'client-ref-1',
      code: 'case-code-1',
      workflowCode: 'workflow-1',
      currentStage: 'stage-1',
      stages: ['stage-1', 'stage-2'],
      createdAt: '2021-01-01T00:00:00.000Z',
      submittedAt: '2021-01-15T10:30:00.000Z',
      status: 'In Review',
      assignedUser: 'john doe'
    }

    const caseInstance = new Case(caseData)

    expect(caseInstance).toEqual({
      _id: 'case-123',
      clientRef: 'client-ref-1',
      code: 'case-code-1',
      workflowCode: 'workflow-1',
      currentStage: 'stage-1',
      stages: ['stage-1', 'stage-2'],
      createdAt: '2021-01-01T00:00:00.000Z',
      submittedAt: '2021-01-15T10:30:00.000Z',
      status: 'In Review',
      assignedUser: 'john doe'
    })
  })

  it('creates a Case model with minimal properties and sets default createdAt', () => {
    const caseData = {
      clientRef: 'client-ref-2',
      code: 'case-code-2'
    }

    const caseInstance = new Case(caseData)

    expect(caseInstance).toEqual({
      _id: undefined,
      clientRef: 'client-ref-2',
      code: 'case-code-2',
      workflowCode: undefined,
      currentStage: undefined,
      stages: [],
      createdAt: undefined,
      submittedAt: undefined,
      status: undefined,
      assignedUser: undefined
    })
  })

  it('creates a Case model with provided createdAt when specified', () => {
    const caseData = {
      clientRef: 'client-ref-3',
      code: 'case-code-3',
      createdAt: '2020-12-01T09:00:00.000Z'
    }

    const caseInstance = new Case(caseData)

    expect(caseInstance.createdAt).toBe('2020-12-01T09:00:00.000Z')
  })

  describe('getFormattedSubmittedDate', () => {
    it('returns formatted date when submittedAt is provided', () => {
      const caseInstance = new Case({
        clientRef: 'client-ref-4',
        code: 'case-code-4',
        submittedAt: '2021-01-15T10:30:00.000Z'
      })

      expect(caseInstance.getFormattedSubmittedDate()).toBe('15/01/2021')
    })

    it('returns "Not submitted" when submittedAt is not provided', () => {
      const caseInstance = new Case({
        clientRef: 'client-ref-5',
        code: 'case-code-5'
      })

      expect(caseInstance.getFormattedSubmittedDate()).toBe('Not submitted')
    })

    it('returns "Not submitted" when submittedAt is null', () => {
      const caseInstance = new Case({
        clientRef: 'client-ref-6',
        code: 'case-code-6',
        submittedAt: null
      })

      expect(caseInstance.getFormattedSubmittedDate()).toBe('Not submitted')
    })
  })

  describe('getStatusDisplay', () => {
    it('returns the status when provided', () => {
      const caseInstance = new Case({
        clientRef: 'client-ref-7',
        code: 'case-code-7',
        status: 'Completed'
      })

      expect(caseInstance.getStatusDisplay()).toBe('Completed')
    })

    it('returns "In Progress" when status is not provided', () => {
      const caseInstance = new Case({
        clientRef: 'client-ref-8',
        code: 'case-code-8'
      })

      expect(caseInstance.getStatusDisplay()).toBe('In Progress')
    })

    it('returns "In Progress" when status is null', () => {
      const caseInstance = new Case({
        clientRef: 'client-ref-9',
        code: 'case-code-9',
        status: null
      })

      expect(caseInstance.getStatusDisplay()).toBe('In Progress')
    })

    it('returns "In Progress" when status is empty string', () => {
      const caseInstance = new Case({
        clientRef: 'client-ref-10',
        code: 'case-code-10',
        status: ''
      })

      expect(caseInstance.getStatusDisplay()).toBe('In Progress')
    })
  })

  describe('getAssignedUserDisplay', () => {
    it('returns the assignedUser value when provided', () => {
      const caseInstance = new Case({
        clientRef: 'client-ref-11',
        code: 'case-code-11',
        assignedUser: 'jane smith'
      })

      expect(caseInstance.getAssignedUserDisplay()).toBe('jane smith')
    })

    it('returns "Unassigned" when assignedUser is not provided', () => {
      const caseInstance = new Case({
        clientRef: 'client-ref-12',
        code: 'case-code-12'
      })

      expect(caseInstance.getAssignedUserDisplay()).toBe('Unassigned')
    })

    it('returns "Unassigned" when assignedUser is null', () => {
      const caseInstance = new Case({
        clientRef: 'client-ref-13',
        code: 'case-code-13',
        assignedUser: null
      })

      expect(caseInstance.getAssignedUserDisplay()).toBe('Unassigned')
    })

    it('returns "Unassigned" when assignedUser is empty string', () => {
      const caseInstance = new Case({
        clientRef: 'client-ref-14',
        code: 'case-code-14',
        assignedUser: ''
      })

      expect(caseInstance.getAssignedUserDisplay()).toBe('Unassigned')
    })
  })
})

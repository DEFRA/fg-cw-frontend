import { describe, test, expect } from 'vitest'
import {
  CaseNotFoundError,
  InvalidCaseStateError,
  CaseRepositoryError,
  CaseUpdateError
} from './case-errors.js'

describe('Case Errors', () => {
  describe('CaseNotFoundError', () => {
    test('creates a CaseNotFoundError with correct properties', () => {
      const caseId = 'case-123'
      const error = new CaseNotFoundError(caseId)

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(CaseNotFoundError)
      expect(error.message).toBe('Case with ID case-123 not found')
      expect(error.name).toBe('CaseNotFoundError')
      expect(error.statusCode).toBe(404)
    })

    test('creates a CaseNotFoundError with null case ID', () => {
      const caseId = null
      const error = new CaseNotFoundError(caseId)

      expect(error.message).toBe('Case with ID null not found')
      expect(error.name).toBe('CaseNotFoundError')
      expect(error.statusCode).toBe(404)
    })
  })

  describe('InvalidCaseStateError', () => {
    test('creates an InvalidCaseStateError with correct properties', () => {
      const message = 'Case is in an invalid state for this operation'
      const error = new InvalidCaseStateError(message)

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(InvalidCaseStateError)
      expect(error.message).toBe(
        'Case is in an invalid state for this operation'
      )
      expect(error.name).toBe('InvalidCaseStateError')
      expect(error.statusCode).toBe(400)
    })

    test('creates an InvalidCaseStateError with different message', () => {
      const message = 'Cannot transition from current stage to target stage'
      const error = new InvalidCaseStateError(message)

      expect(error.message).toBe(
        'Cannot transition from current stage to target stage'
      )
      expect(error.name).toBe('InvalidCaseStateError')
      expect(error.statusCode).toBe(400)
    })

    test('creates an InvalidCaseStateError with empty message', () => {
      const message = ''
      const error = new InvalidCaseStateError(message)

      expect(error.message).toBe('')
      expect(error.name).toBe('InvalidCaseStateError')
      expect(error.statusCode).toBe(400)
    })
  })

  describe('CaseRepositoryError', () => {
    test('creates a CaseRepositoryError with correct properties', () => {
      const message = 'Database connection failed'
      const error = new CaseRepositoryError(message)

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(CaseRepositoryError)
      expect(error.message).toBe('Database connection failed')
      expect(error.name).toBe('CaseRepositoryError')
      expect(error.statusCode).toBe(500)
    })

    test('creates a CaseRepositoryError with different message', () => {
      const message = 'Failed to retrieve case from repository'
      const error = new CaseRepositoryError(message)

      expect(error.message).toBe('Failed to retrieve case from repository')
      expect(error.name).toBe('CaseRepositoryError')
      expect(error.statusCode).toBe(500)
    })

    test('creates a CaseRepositoryError with null message', () => {
      const message = null
      const error = new CaseRepositoryError(message)

      expect(error.message).toBe('null')
      expect(error.name).toBe('CaseRepositoryError')
      expect(error.statusCode).toBe(500)
    })
  })

  describe('CaseUpdateError', () => {
    test('creates a CaseUpdateError with correct properties', () => {
      const message = 'Failed to update case in database'
      const error = new CaseUpdateError(message)

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(CaseUpdateError)
      expect(error.message).toBe('Failed to update case in database')
      expect(error.name).toBe('CaseUpdateError')
      expect(error.statusCode).toBe(500)
    })

    test('creates a CaseUpdateError with different message', () => {
      const message = 'Validation failed during case update'
      const error = new CaseUpdateError(message)

      expect(error.message).toBe('Validation failed during case update')
      expect(error.name).toBe('CaseUpdateError')
      expect(error.statusCode).toBe(500)
    })

    test('creates a CaseUpdateError with undefined message', () => {
      const message = undefined
      const error = new CaseUpdateError(message)

      expect(error.message).toBe('')
      expect(error.name).toBe('CaseUpdateError')
      expect(error.statusCode).toBe(500)
    })
  })

  describe('Error inheritance', () => {
    test('all custom errors inherit from Error', () => {
      const caseNotFoundError = new CaseNotFoundError('test-id')
      const invalidCaseStateError = new InvalidCaseStateError('test message')
      const caseRepositoryError = new CaseRepositoryError('test message')
      const caseUpdateError = new CaseUpdateError('test message')

      expect(caseNotFoundError).toBeInstanceOf(Error)
      expect(invalidCaseStateError).toBeInstanceOf(Error)
      expect(caseRepositoryError).toBeInstanceOf(Error)
      expect(caseUpdateError).toBeInstanceOf(Error)
    })

    test('all custom errors have stack traces', () => {
      const caseNotFoundError = new CaseNotFoundError('test-id')
      const invalidCaseStateError = new InvalidCaseStateError('test message')
      const caseRepositoryError = new CaseRepositoryError('test message')
      const caseUpdateError = new CaseUpdateError('test message')

      expect(caseNotFoundError.stack).toBeDefined()
      expect(invalidCaseStateError.stack).toBeDefined()
      expect(caseRepositoryError.stack).toBeDefined()
      expect(caseUpdateError.stack).toBeDefined()
    })
  })
})

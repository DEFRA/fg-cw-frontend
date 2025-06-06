export class CaseNotFoundError extends Error {
  constructor(caseId) {
    super(`Case with ID ${caseId} not found`)
    this.name = 'CaseNotFoundError'
    this.statusCode = 404
  }
}

export class InvalidCaseStateError extends Error {
  constructor(message) {
    super(message)
    this.name = 'InvalidCaseStateError'
    this.statusCode = 400
  }
}

export class CaseRepositoryError extends Error {
  constructor(message) {
    super(message)
    this.name = 'CaseRepositoryError'
    this.statusCode = 500
  }
}

export class CaseUpdateError extends Error {
  constructor(message) {
    super(message)
    this.name = 'CaseUpdateError'
    this.statusCode = 500
  }
}

export class Case {
  constructor({
    _id,
    clientRef,
    code,
    workflowCode,
    currentStage,
    stages = [],
    createdAt,
    submittedAt,
    status,
    assignedTo
  }) {
    this._id = _id
    this.clientRef = clientRef
    this.code = code
    this.workflowCode = workflowCode
    this.currentStage = currentStage
    this.stages = stages
    this.createdAt = createdAt ?? new Date().toISOString()
    this.submittedAt = submittedAt
    this.status = status
    this.assignedTo = assignedTo
  }

  getFormattedSubmittedDate() {
    if (!this.submittedAt) return 'Not submitted'
    return new Date(this.submittedAt).toLocaleDateString('en-GB')
  }

  getStatusDisplay() {
    return this.status || 'In Progress'
  }

  getAssignedToDisplay() {
    return this.assignedTo || 'Unassigned'
  }
}

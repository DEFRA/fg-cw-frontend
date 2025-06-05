import { wreck } from '../../server/common/helpers/wreck.js'
import { Case } from '../entities/case.js'
import {
  CaseRepositoryError,
  CaseNotFoundError,
  CaseUpdateError
} from '../errors/case-errors.js'

const toCase = (data) =>
  new Case({
    _id: data._id,
    clientRef: data.payload?.clientRef || data.caseRef,
    code: data.payload?.code,
    workflowCode: data.workflowCode,
    currentStage: data.currentStage,
    stages: data.stages || [],
    createdAt: data.payload?.createdAt || data.createdAt,
    submittedAt: data.payload?.submittedAt || data.submittedAt,
    status: data.status,
    assignedTo: data.assignedUser
  })

export const findAll = async () => {
  try {
    const { payload } = await wreck.get('/cases')
    const cases = payload.data || []
    return cases.map(toCase)
  } catch (error) {
    throw new CaseRepositoryError('Failed to fetch cases')
  }
}

export const findById = async (caseId) => {
  try {
    const { payload } = await wreck.get(`/cases/${caseId}`)
    return payload ? toCase(payload) : null
  } catch (error) {
    throw new CaseNotFoundError('Failed to fetch case by ID')
  }
}

export const updateStage = async (caseId) => {
  try {
    const { payload } = await wreck.post(`/cases/${caseId}/stage`)
    return payload ? toCase(payload) : null
  } catch (error) {
    throw new CaseUpdateError('Failed to update case stage')
  }
}

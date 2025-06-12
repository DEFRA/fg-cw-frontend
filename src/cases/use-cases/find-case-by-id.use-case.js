import { findById } from '../repositories/case.repository.js'

export const findCaseByIdUseCase = async (caseId) => {
  const caseData = await findById(caseId)
  return caseData
}

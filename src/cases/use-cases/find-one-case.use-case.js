import { findById } from '../repositories/case.repository.js'

export const findOneCaseUseCase = async (caseId) => {
  const cases = await findById(caseId)
  return cases
}
